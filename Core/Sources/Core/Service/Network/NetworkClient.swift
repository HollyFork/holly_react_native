import Foundation
import Combine

// MARK: - API Error DTO (décodage des erreurs métier)
private struct APIErrorResponse: Decodable {
    let nonFieldErrors: [String]?
    let detail: String?

    enum CodingKeys: String, CodingKey {
        case nonFieldErrors = "non_field_errors"
        case detail
    }

    var message: String {
        nonFieldErrors?.first ?? detail ?? "Une erreur est survenue."
    }
}

// MARK: - NetworkClient
public final class NetworkClient {

    private let session: URLSession
    private let decoder: JSONDecoder
    private let logger = NetworkLogger.shared

    public init(session: URLSession = .shared) {
        self.session = session
        self.decoder = JSONDecoder()
    }

    // MARK: - POST
    public func post<Body: Encodable, Response: Decodable>(
        endpoint: APIEndpoint,
        body: Body
    ) -> AnyPublisher<Response, AuthError> {
        buildRequest(endpoint: endpoint, method: "POST", body: body)
            .flatMap { self.execute($0) }
            .eraseToAnyPublisher()
    }

    // MARK: - GET (Bearer)
    public func get<Response: Decodable>(
        endpoint: APIEndpoint
    ) -> AnyPublisher<Response, AuthError> {
        buildRequest(endpoint: endpoint, method: "GET", body: Optional<String>.none)
            .flatMap { request -> AnyPublisher<URLRequest, AuthError> in
                // Inject Bearer token
                guard let token = KeychainManager.shared.getToken() else {
                    return Fail(error: AuthError.deviceNotConfigured).eraseToAnyPublisher()
                }
                var authenticated = request
                authenticated.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
                return Just(authenticated).setFailureType(to: AuthError.self).eraseToAnyPublisher()
            }
            .flatMap { self.execute($0) }
            .eraseToAnyPublisher()
    }
    // MARK: - GET  Param(Bearer)
    public func getWithParams<Response: Decodable>(
        endpoint: APIEndpoint,
        queryItems: [URLQueryItem]
    ) -> AnyPublisher<Response, AuthError> {
        // Construit l'URL avec query params
        guard let baseURL = endpoint.url,
              var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: false) else {
            return Fail(error: AuthError.networkError("URL invalide: \(endpoint.path)"))
                .eraseToAnyPublisher()
        }

        let filtered = queryItems.filter { $0.value != nil && !($0.value?.isEmpty ?? true) }
        if !filtered.isEmpty { components.queryItems = filtered }

        guard let url = components.url else {
            return Fail(error: AuthError.networkError("URL avec params invalide"))
                .eraseToAnyPublisher()
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Inject Bearer token
        if let token = KeychainManager.shared.getToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        return execute(request)
    }

    // MARK: - Build Request
    private func buildRequest<Body: Encodable>(
        endpoint: APIEndpoint,
        method: String,
        body: Body?
    ) -> AnyPublisher<URLRequest, AuthError> {
        guard let url = endpoint.url else {
            return Fail(error: AuthError.networkError("URL invalide: \(endpoint.path)"))
                .eraseToAnyPublisher()
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let body {
            do {
                request.httpBody = try JSONEncoder().encode(body)
            } catch {
                return Fail(error: AuthError.networkError("Encodage body échoué"))
                    .eraseToAnyPublisher()
            }
        }

        return Just(request)
            .setFailureType(to: AuthError.self)
            .eraseToAnyPublisher()
    }

    // MARK: - Execute (logging centralisé ici)
    private func execute<Response: Decodable>(
        _ request: URLRequest
    ) -> AnyPublisher<Response, AuthError> {
        logger.logRequest(request)
        let start = Date()

        return performRequest(request, start: start)
            .catch { [weak self] error -> AnyPublisher<Response, AuthError> in
                guard let self else {
                    return Fail(error: error).eraseToAnyPublisher()
                }
                // ── Si 401 → refresh puis retry une fois ──────────
                if case .serverError(let msg) = error, msg.contains("401") {
                    return TokenRefresher.shared.refreshIfNeeded()
                        .flatMap { newToken -> AnyPublisher<Response, AuthError> in
                            // Rebuild request avec le nouveau token
                            var retryRequest = request
                            retryRequest.setValue("Bearer \(newToken)", forHTTPHeaderField: "Authorization")
                            return self.performRequest(retryRequest, start: Date())
                        }
                        .eraseToAnyPublisher()
                }
                return Fail(error: error).eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }

    // ── Extrait la logique réseau pure (appelée par execute + retry) ──
    private func performRequest<Response: Decodable>(
        _ request: URLRequest,
        start: Date
    ) -> AnyPublisher<Response, AuthError> {
        session.dataTaskPublisher(for: request)
            .tryMap { [weak self] data, response -> Response in
                guard let self else { throw AuthError.unknown }

                let http     = response as? HTTPURLResponse
                let duration = Date().timeIntervalSince(start)
                self.logger.logResponse(http, data: data, error: nil, duration: duration)

                guard let http else { throw AuthError.invalidResponse }

                guard (200...299).contains(http.statusCode) else {
                    let apiError = try? self.decoder.decode(APIErrorResponse.self, from: data)
                    // ⚠️ On encode le status code dans le message pour le catch
                    throw AuthError.serverError("401|\(apiError?.message ?? "HTTP \(http.statusCode)")")
                }

                do {
                    return try self.decoder.decode(Response.self, from: data)
                } catch let decodeError as DecodingError {
                    self.logger.logDecodeError(decodeError, data: data)
                    throw AuthError.decodingError
                }
            }
            .mapError { [weak self] error -> AuthError in
                if let urlError = error as? URLError {
                    self?.logger.logResponse(nil, data: nil, error: urlError, duration: 0)
                    return AuthError.networkError(urlError.localizedDescription)
                }
                return (error as? AuthError) ?? AuthError.unknown
            }
            .eraseToAnyPublisher()
    }
    
    public func put<Body: Encodable, Response: Decodable>(
        endpoint: APIEndpoint,
        body: Body
    ) -> AnyPublisher<Response, AuthError> {
        buildRequest(endpoint: endpoint, method: "PUT", body: body)
            .flatMap { self.execute($0) }
            .eraseToAnyPublisher()
    }

    public func delete(endpoint: APIEndpoint) -> AnyPublisher<Void, AuthError> {
 
        guard let url = endpoint.url else {
            return Fail(error: AuthError.networkError("URL invalide: \(endpoint.path)"))
                .eraseToAnyPublisher()
        }

        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = KeychainManager.shared.getToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        logger.logRequest(request)
        let start = Date()

        return session.dataTaskPublisher(for: request)
            .tryMap { [weak self] data, response -> Void in
                let http     = response as? HTTPURLResponse
                let duration = Date().timeIntervalSince(start)
                self?.logger.logResponse(http, data: data, error: nil, duration: duration)

                guard let http else { throw AuthError.invalidResponse }

                guard (200...299).contains(http.statusCode) else {
                    let apiError = try? self?.decoder.decode(APIErrorResponse.self, from: data)
                    throw AuthError.serverError("401|DELETE \(http.statusCode): \(apiError?.message ?? "")")
                }
                return ()
            }
            .mapError { [weak self] error -> AuthError in
                if let urlError = error as? URLError {
                    self?.logger.logResponse(nil, data: nil, error: urlError, duration: 0)
                    return AuthError.networkError(urlError.localizedDescription)
                }
                return (error as? AuthError) ?? AuthError.unknown
            }
            .eraseToAnyPublisher()
    }
    
    // MARK: - POST async/await
    public func postAsync<Body: Encodable, Response: Decodable>(
        endpoint: APIEndpoint,
        body: Body
    ) async throws -> Response {
        guard let url = endpoint.url else {
            throw AuthError.networkError("URL invalide: \(endpoint.path)")
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = KeychainManager.shared.getToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        request.httpBody = try JSONEncoder().encode(body)
        logger.logRequest(request)
        let start = Date()

        let (data, response) = try await session.data(for: request)
        let http = response as? HTTPURLResponse
        logger.logResponse(http, data: data, error: nil, duration: Date().timeIntervalSince(start))

        guard let http else { throw AuthError.invalidResponse }

        guard (200...299).contains(http.statusCode) else {
            let apiError = try? decoder.decode(APIErrorResponse.self, from: data)
            throw AuthError.serverError(apiError?.message ?? "HTTP \(http.statusCode)")
        }

        do {
            return try decoder.decode(Response.self, from: data)
        } catch let decodeError as DecodingError {
            logger.logDecodeError(decodeError, data: data)
            throw AuthError.decodingError
        }
    }

    // MARK: - PATCH async/await
    public func patchAsync<Body: Encodable, Response: Decodable>(
        endpoint: APIEndpoint,
        body: Body
    ) async throws -> Response {
        guard let url = endpoint.url else {
            throw AuthError.networkError("URL invalide: \(endpoint.path)")
        }

        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = KeychainManager.shared.getToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        request.httpBody = try JSONEncoder().encode(body)
        logger.logRequest(request)
        let start = Date()

        let (data, response) = try await session.data(for: request)
        let http = response as? HTTPURLResponse
        logger.logResponse(http, data: data, error: nil, duration: Date().timeIntervalSince(start))

        guard let http else { throw AuthError.invalidResponse }

        guard (200...299).contains(http.statusCode) else {
            let apiError = try? decoder.decode(APIErrorResponse.self, from: data)
            throw AuthError.serverError(apiError?.message ?? "HTTP \(http.statusCode)")
        }

        do {
            return try decoder.decode(Response.self, from: data)
        } catch let decodeError as DecodingError {
            logger.logDecodeError(decodeError, data: data)
            throw AuthError.decodingError
        }
    }

    // MARK: - GET async/await (avec params)
    public func getAsync<Response: Decodable>(
        endpoint: APIEndpoint,
        queryItems: [URLQueryItem] = []
    ) async throws -> Response {
        guard let baseURL = endpoint.url,
              var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: false) else {
            throw AuthError.networkError("URL invalide: \(endpoint.path)")
        }

        let filtered = queryItems.filter { $0.value != nil && !($0.value?.isEmpty ?? true) }
        if !filtered.isEmpty { components.queryItems = filtered }

        guard let url = components.url else {
            throw AuthError.networkError("URL avec params invalide")
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = KeychainManager.shared.getToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        logger.logRequest(request)
        let start = Date()

        let (data, response) = try await session.data(for: request)
        let http = response as? HTTPURLResponse
        logger.logResponse(http, data: data, error: nil, duration: Date().timeIntervalSince(start))

        guard let http else { throw AuthError.invalidResponse }

        guard (200...299).contains(http.statusCode) else {
            let apiError = try? decoder.decode(APIErrorResponse.self, from: data)
            throw AuthError.serverError(apiError?.message ?? "HTTP \(http.statusCode)")
        }

        do {
            return try decoder.decode(Response.self, from: data)
        } catch let decodeError as DecodingError {
            logger.logDecodeError(decodeError, data: data)
            throw AuthError.decodingError
        }
    }
}

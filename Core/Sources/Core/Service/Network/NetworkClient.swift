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
        // 1. Log request
        logger.logRequest(request)
        let start = Date()

        return session.dataTaskPublisher(for: request)
            .tryMap { [weak self] data, response -> Response in
                guard let self else { throw AuthError.unknown }

                let http     = response as? HTTPURLResponse
                let duration = Date().timeIntervalSince(start)

                // 2. Log response (toujours, succès ou échec)
                self.logger.logResponse(http, data: data, error: nil, duration: duration)

                guard let http else { throw AuthError.invalidResponse }

                // 3. Erreur HTTP → décode le message métier
                guard (200...299).contains(http.statusCode) else {
                    let apiError = try? self.decoder.decode(APIErrorResponse.self, from: data)
                    throw AuthError.serverError(apiError?.message ?? "HTTP \(http.statusCode)")
                }

                // 4. Décodage — log détaillé si erreur
                do {
                    return try self.decoder.decode(Response.self, from: data)
                } catch let decodeError as DecodingError {
                    self.logger.logDecodeError(decodeError, data: data)
                    throw AuthError.decodingError
                }
            }
            .mapError { [weak self] error -> AuthError in
                // Log les erreurs réseau (timeout, pas de connexion…)
                if let urlError = error as? URLError {
                    self?.logger.logResponse(nil, data: nil, error: urlError, duration: Date().timeIntervalSince(start))
                    return AuthError.networkError(urlError.localizedDescription)
                }
                return (error as? AuthError) ?? AuthError.unknown
            }
            .eraseToAnyPublisher()
    }
}

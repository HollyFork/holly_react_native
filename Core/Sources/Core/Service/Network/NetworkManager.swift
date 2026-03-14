import Foundation

final class NetworkManager {
    static let shared = NetworkManager()
    private init() {}
    
    // MARK: - GET
    
    func getRequest<T: Decodable>(
        from endpoint: APIEndpoint,
        queryItems: [URLQueryItem]? = nil,
        responseType: T.Type,
        completion: @escaping (Result<T, Error>) -> Void
    ) {
        guard var url = endpoint.url else {
            completion(.failure(NSError(domain: "Invalid URL", code: 0)))
            return
        }
        
        if let queryItems = queryItems,
           var components = URLComponents(url: url, resolvingAgainstBaseURL: false) {
            components.queryItems = queryItems
            url = components.url ?? url
        }
        
        print("📡 GET \(endpoint.path)")
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        
        if let token = KeychainManager.shared.getToken() {
            request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            self.handleResponse(
                data: data,
                response: response,
                error: error,
                responseType: responseType,
                completion: completion
            )
        }.resume()
    }
    
    // MARK: - POST
    
    func postRequest<T: Decodable>(
        to endpoint: APIEndpoint,
        body: Encodable? = nil,
        responseType: T.Type,
        completion: @escaping (Result<T, Error>) -> Void
    ) {
        guard let url = endpoint.url else {
            completion(.failure(NSError(domain: "Invalid URL", code: 0)))
            return
        }
        
        print("📤 POST \(endpoint.path)")
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let token = KeychainManager.shared.getToken() {
            request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = body {
            do {
                let encoder = JSONEncoder()
                request.httpBody = try encoder.encode(AnyEncodable(body))
                if let bodyString = String(data: request.httpBody ?? Data(), encoding: .utf8) {
                    print("📦 Body: \(bodyString)")
                }
            } catch {
                completion(.failure(error))
                return
            }
        }
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            self.handleResponse(
                data: data,
                response: response,
                error: error,
                responseType: responseType,
                completion: completion
            )
        }.resume()
    }
    
    // MARK: - PATCH
    
    func patchRequest<T: Decodable>(
        to endpoint: APIEndpoint,
        body: Encodable,
        responseType: T.Type,
        completion: @escaping (Result<T, Error>) -> Void
    ) {
        guard let url = endpoint.url else {
            completion(.failure(NSError(domain: "Invalid URL", code: 0)))
            return
        }
        
        guard let token = KeychainManager.shared.getToken() else {
            completion(.failure(NSError(domain: "No token", code: 401)))
            return
        }
        
        print("🔄 PATCH \(endpoint.path)")
        
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        do {
            let encoder = JSONEncoder()
            request.httpBody = try encoder.encode(AnyEncodable(body))
            if let bodyString = String(data: request.httpBody ?? Data(), encoding: .utf8) {
                print("📦 Body: \(bodyString)")
            }
        } catch {
            completion(.failure(error))
            return
        }
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            self.handleResponse(
                data: data,
                response: response,
                error: error,
                responseType: responseType,
                completion: completion
            )
        }.resume()
    }
    
    // MARK: - DELETE (sans generic de réponse → juste succès / erreur)
    // Si tu as besoin de décoder un body sur DELETE, on fera une variante générique à part.
    
    func deleteRequest(
        to endpoint: APIEndpoint,
        completion: @escaping (Result<Void, Error>) -> Void
    ) {
        guard let url = endpoint.url else {
            completion(.failure(NSError(domain: "Invalid URL", code: 0)))
            return
        }
        
        guard let token = KeychainManager.shared.getToken() else {
            completion(.failure(NSError(domain: "No token", code: 401)))
            return
        }
        
        print("🗑️ DELETE \(endpoint.path)")
        
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("❌ Network error: \(error)")
                completion(.failure(error))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse else {
                completion(.failure(NSError(domain: "Invalid response", code: 0)))
                return
            }
            
            print("📥 Status: \(httpResponse.statusCode)")
            
            guard (200...299).contains(httpResponse.statusCode) else {
                if let data = data,
                   let errorBody = String(data: data, encoding: .utf8) {
                    print("❌ HTTP \(httpResponse.statusCode): \(errorBody)")
                }
                completion(.failure(NSError(domain: "HTTP \(httpResponse.statusCode)", code: httpResponse.statusCode)))
                return
            }
            
            completion(.success(()))
        }.resume()
    }
    
    // MARK: - Handler commun
    
    private func handleResponse<T: Decodable>(
        data: Data?,
        response: URLResponse?,
        error: Error?,
        responseType: T.Type,
        completion: @escaping (Result<T, Error>) -> Void
    ) {
        if let error = error {
            print("❌ Network error: \(error)")
            completion(.failure(error))
            return
        }
        
        guard let data = data else {
            print("❌ No data")
            completion(.failure(NSError(domain: "No data", code: 0)))
            return
        }
        
        guard let httpResponse = response as? HTTPURLResponse else {
            print("❌ Invalid response")
            completion(.failure(NSError(domain: "Invalid response", code: 0)))
            return
        }
        
        print("📥 Status: \(httpResponse.statusCode)")
        
        guard (200...299).contains(httpResponse.statusCode) else {
            if let errorBody = String(data: data, encoding: .utf8) {
                print("❌ HTTP \(httpResponse.statusCode): \(errorBody)")
            }
            completion(.failure(NSError(domain: "HTTP \(httpResponse.statusCode)", code: httpResponse.statusCode)))
            return
        }
        
        do {
            let decoded = try JSONDecoder().decode(responseType, from: data)
            completion(.success(decoded))
        } catch {
            print("❌ JSON decode error: \(error)")
            completion(.failure(error))
        }
    }
    
    // MARK: - REFRESH TOKEN (POUR TokenRefresher)
    func refreshToken(completion: @escaping (Result<Void, Error>) -> Void) {
        guard let url = APIEndpoint.refreshToken.url else {
            completion(.failure(NSError(domain: "Invalid refresh URL", code: 0)))
            return
        }
        
        guard let refreshToken = KeychainManager.shared.getRefreshToken() else {
            completion(.failure(NSError(domain: "No refresh token", code: 401)))
            return
        }
        
        print("🔄 Auto-refresh token...")
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let refreshBody = ["refresh": refreshToken]
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: refreshBody)
        } catch {
            completion(.failure(error))
            return
        }
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("❌ Refresh error: \(error)")
                completion(.failure(error))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode) else {
                print("❌ Refresh HTTP error: \((response as? HTTPURLResponse)?.statusCode ?? 0)")
                completion(.failure(NSError(domain: "Refresh failed", code: (response as? HTTPURLResponse)?.statusCode ?? 0)))
                return
            }
            
            guard let data = data else {
                completion(.failure(NSError(domain: "No refresh data", code: 0)))
                return
            }
            
            do {
                // API retourne { "access": "new_token" }
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: String],
                   let newAccessToken = json["access"] {
                    KeychainManager.shared.saveToken(newAccessToken)
                    print("✅ Token refreshé avec succès")
                    completion(.success(()))
                } else {
                    completion(.failure(NSError(domain: "Invalid refresh response", code: 0)))
                }
            } catch {
                print("❌ Refresh decode error: \(error)")
                completion(.failure(error))
            }
        }.resume()
    }

}

/// Petit wrapper pour encoder `Encodable` dans une fonction générique
private struct AnyEncodable: Encodable {
    private let encodeFunc: (Encoder) throws -> Void
    
    init(_ encodable: Encodable) {
        self.encodeFunc = encodable.encode
    }
    
    func encode(to encoder: Encoder) throws {
        try encodeFunc(encoder)
    }
}

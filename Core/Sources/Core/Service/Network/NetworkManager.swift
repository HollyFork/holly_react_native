import Foundation

class NetworkManager {
    
    static let shared = NetworkManager()
    private init() {}
    
    // MARK: - GET
    
    func getRequest(from endpoint: APIEndpoint, completion: @escaping (Result<Data, Error>) -> Void) {
        guard let url = endpoint.url else {
            completion(.failure(NSError(domain: "Invalid URL", code: 0)))
            return
        }
        URLSession.shared.dataTask(with: url) { data, _, error in
            if let error = error { completion(.failure(error)); return }
            guard let data = data else {
                completion(.failure(NSError(domain: "No data", code: 0))); return
            }
            completion(.success(data))
        }.resume()
    }
    
    // MARK: - POST avec Auth + Auto-refresh si 401
    
    func postRequestWithAuth<T: Codable>(
        to endpoint: APIEndpoint,
        body: T,
        retryOnUnauthorized: Bool = true,
        completion: @escaping (Result<Data, Error>) -> Void
    ) {
        guard let url = endpoint.url else {
            completion(.failure(NSError(domain: "Invalid URL", code: 0))); return
        }
        guard let token = KeychainManager.shared.getToken() else {
            completion(.failure(NSError(domain: "No token", code: 401))); return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.httpBody = try? JSONEncoder().encode(body)
        
        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            if let error = error { completion(.failure(error)); return }
            
            // Si 401 → on tente un refresh puis on rejoue la requête UNE fois
            if let http = response as? HTTPURLResponse, http.statusCode == 401, retryOnUnauthorized {
                self?.refreshToken { result in
                    switch result {
                    case .success:
                        self?.postRequestWithAuth(to: endpoint, body: body,
                                                  retryOnUnauthorized: false,
                                                  completion: completion)
                    case .failure(let err):
                        completion(.failure(err))
                    }
                }
                return
            }
            
            guard let data = data else {
                completion(.failure(NSError(domain: "No data", code: 0))); return
            }
            completion(.success(data))
        }.resume()
    }
    
    // MARK: - Refresh Token
    
    func refreshToken(completion: @escaping (Result<String, Error>) -> Void) {
        guard let url = APIEndpoint.refresh.url else {
            completion(.failure(NSError(domain: "Invalid URL", code: 0))); return
        }
        guard let refreshToken = KeychainManager.shared.getRefreshToken() else {
            print("❌ Pas de refresh token en Keychain — reconnexion requise")
            completion(.failure(NSError(domain: "No refresh token", code: 0))); return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try? JSONSerialization.data(withJSONObject: ["refresh": refreshToken])
        
        print("🔄 Tentative refresh token…")
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error { completion(.failure(error)); return }
            guard let data = data else {
                completion(.failure(NSError(domain: "No data", code: 0))); return
            }
            if let http = response as? HTTPURLResponse {
                print("📥 Refresh status: \(http.statusCode)")
            }
            do {
                let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
                if let newAccessToken = json?["access"] as? String {
                    _ = KeychainManager.shared.saveToken(newAccessToken)
                    SessionCache.shared.accessToken = newAccessToken
                    print("✅ Token rafraîchi avec succès")
                    completion(.success(newAccessToken))
                } else {
                    print("❌ Réponse refresh invalide: \(String(data: data, encoding: .utf8) ?? "")")
                    completion(.failure(NSError(domain: "Invalid response", code: 0)))
                }
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
}

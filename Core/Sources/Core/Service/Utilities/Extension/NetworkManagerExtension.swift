import Foundation

extension NetworkManager {
    
    // postRequest reste ici dans l'extension (ne pas le redéclarer dans NetworkManager.swift)
    func postRequest(to endpoint: APIEndpoint, completion: @escaping (Result<Data, Error>) -> Void) {
        guard let url = endpoint.url else {
            completion(.failure(NSError(domain: "Invalid URL", code: 0)))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        if let token = KeychainManager.shared.getToken() {
            request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(NSError(domain: "No data", code: 0)))
                return
            }
            
            completion(.success(data))
        }.resume()
    }
    
    // logout reste ici dans l'extension (ne pas le redéclarer dans NetworkManager.swift)
    func logout(completion: @escaping (Result<String, Error>) -> Void) {
        postRequest(to: .logout) { result in
            switch result {
            case .success(let data):
                if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let message = json["message"] as? String {
                    // Nettoyage complet à la déconnexion
                    KeychainManager.shared.clearAll()
                    TokenRefresher.shared.stopRefreshing()
                    completion(.success(message))
                } else {
                    completion(.failure(NSError(domain: "Invalid response", code: 0)))
                }
            case .failure(let error):
                completion(.failure(error))
            }
        }
    }
}

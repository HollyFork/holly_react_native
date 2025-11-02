
import Foundation

class NetworkManager {
    
    static let shared = NetworkManager()
    private init() {}
    
    func getRequest(from endpoint: APIEndpoint, completion: @escaping (Result<Data, Error>) -> Void) {
        guard let url = endpoint.url else {
            completion(.failure(NSError(domain: "Invalid URL", code: 0)))
            return
        }
        
        URLSession.shared.dataTask(with: url) { data, response, error in
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
    
    func refreshToken(completion: @escaping (Result<String, Error>) -> Void) {
        guard let url = APIEndpoint.refresh.url else {
            completion(.failure(NSError(domain: "Invalid URL", code: 0)))
            return
        }
        
        guard let refreshToken = KeychainManager.shared.getRefreshToken() else {
            completion(.failure(NSError(domain: "No refresh token", code: 0)))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try? JSONSerialization.data(withJSONObject: ["refresh": refreshToken])
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(NSError(domain: "No data", code: 0)))
                return
            }
            
            do {
                let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
                if let newAccessToken = json?["access"] as? String {
                    KeychainManager.shared.saveToken(newAccessToken)
                    completion(.success(newAccessToken))
                } else {
                    completion(.failure(NSError(domain: "Invalid response", code: 0)))
                }
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
}



    
 


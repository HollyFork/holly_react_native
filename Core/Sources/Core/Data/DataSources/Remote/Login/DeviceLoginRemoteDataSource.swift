import Foundation

public protocol LoginRemoteDataSource {
    func login(request: LoginRequest) async throws -> LoginResponseDTO
}

public class LoginRemoteDataSourceImpl: LoginRemoteDataSource {
    
    public init() {}
    
    public func login(request loginRequest: LoginRequest) async throws -> LoginResponseDTO {
        guard let url = APIEndpoint.login.url else {
            fatalError("URL login invalide")
        }
        
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.httpBody = try JSONEncoder().encode(loginRequest)
        
        let (data, response) = try await URLSession.shared.data(for: urlRequest)
        
        if let httpResponse = response as? HTTPURLResponse {
            print("Status: \(httpResponse.statusCode)")
        }
        
        let responseText = String(data: data, encoding: .utf8) ?? StringConstants.EMPTY_STRING
        print("Response: \(responseText)")
        
        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let errors = json["non_field_errors"] as? [String],
           let message = errors.first {
            throw NSError(domain: "LoginError",
                          code: 400,
                          userInfo: [NSLocalizedDescriptionKey: message])
        }
        
        if responseText.contains("<html") {
            throw NSError(domain: "LoginError",
                          code: -1,
                          userInfo: [NSLocalizedDescriptionKey: "Serveur retourne du HTML, vérifiez l'URL et le backend."])
        }
        
        return try JSONDecoder().decode(LoginResponseDTO.self, from: data)
    }
}

import Foundation

public protocol EmployeeLoginRemoteDataSource {
    func loginEmployee(request: EmployeeLoginRequest) async throws -> EmployeeLoginResponse
}

public class EmployeeLoginRemoteDataSourceImpl: EmployeeLoginRemoteDataSource {
    
    public init() {}
    
    public func loginEmployee(request: EmployeeLoginRequest) async throws -> EmployeeLoginResponse {
        
        guard let url = APIEndpoint.quickLogin.url else {
            fatalError("URL quickLogin invalide")
        }
        
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.httpBody = try JSONEncoder().encode(request)
        
        // 🔹 Print de la requête pour debug
        if let bodyString = String(data: urlRequest.httpBody ?? Data(), encoding: .utf8) {
            print("📤 URL : \(urlRequest.url?.absoluteString ?? "")")
            print("📤 Body envoyé : \(bodyString)")
        }
        
        let (data, response) = try await URLSession.shared.data(for: urlRequest)
        
        if let httpResponse = response as? HTTPURLResponse {
            print("📥 Status Code Quick Login: \(httpResponse.statusCode)")
        }
        
        let responseText = String(data: data, encoding: .utf8) ?? ""
        print("📥 Response Raw: \(responseText)")
        
        // Vérification des erreurs
        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let errors = json["non_field_errors"] as? [String],
           let message = errors.first {
            throw NSError(domain: "EmployeeLoginError",
                          code: 400,
                          userInfo: [NSLocalizedDescriptionKey: message])
        }
        
        if responseText.contains("<html") {
            throw NSError(domain: "EmployeeLoginError",
                          code: -1,
                          userInfo: [NSLocalizedDescriptionKey: "Serveur retourne du HTML, vérifiez l'URL et le backend."])
        }
        
        return try JSONDecoder().decode(EmployeeLoginResponse.self, from: data)
    }
}

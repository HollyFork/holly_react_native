import Foundation

public protocol DeviceLoginRemoteDataSource {
    func login(request: DeviceLoginRequest) async throws -> DeviceLoginResponse
}

public class DeviceLoginRemoteDataSourceImpl: DeviceLoginRemoteDataSource {
    
    public init() {}
    
    public func login(request: DeviceLoginRequest) async throws -> DeviceLoginResponse {
        guard let url = APIEndpoint.deviceLogin.url else {
            fatalError("URL deviceLogin invalide")
        }
        
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.httpBody = try JSONEncoder().encode(request)
        
        print("📤 URL : \(url.absoluteString)")
        if let bodyStr = String(data: urlRequest.httpBody ?? Data(), encoding: .utf8) {
            print("📤 Body envoyé : \(bodyStr)")
        }
        
        let (data, response) = try await URLSession.shared.data(for: urlRequest)
        
        if let httpResponse = response as? HTTPURLResponse {
            print("📥 Status Code Device Login: \(httpResponse.statusCode)")
        }
        
        let responseText = String(data: data, encoding: .utf8) ?? ""
        print("📥 Response brute : \(responseText)")
        
        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let errors = json["non_field_errors"] as? [String],
           let message = errors.first {
            throw NSError(domain: "DeviceLoginError",
                          code: 400,
                          userInfo: [NSLocalizedDescriptionKey: message])
        }
        
        return try JSONDecoder().decode(DeviceLoginResponse.self, from: data)
    }
}

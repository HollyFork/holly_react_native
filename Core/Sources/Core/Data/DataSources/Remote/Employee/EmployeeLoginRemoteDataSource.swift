import Foundation

public protocol EmployeeLoginRemoteDataSource {
    func loginEmployee(request: EmployeeLoginRequest) async throws -> EmployeeLoginDTO
}

public class EmployeeLoginRemoteDataSourceImpl: EmployeeLoginRemoteDataSource {
    
    public init() {}
    
    public func loginEmployee(request: EmployeeLoginRequest) async throws -> EmployeeLoginDTO {
        guard let url = APIEndpoint.verifyPin.url else {
            throw NSError(domain: "Invalid URL", code: 0)
        }
        
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let token = KeychainManager.shared.getToken() {
            urlRequest.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        urlRequest.httpBody = try JSONEncoder().encode(request)
        
        let (data, _) = try await URLSession.shared.data(for: urlRequest)
        return try JSONDecoder().decode(EmployeeLoginDTO.self, from: data)
    }
}

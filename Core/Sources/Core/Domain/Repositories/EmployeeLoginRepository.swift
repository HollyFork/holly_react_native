import Foundation

public protocol EmployeeLoginRepository {
    func loginEmployee(pin: String) async throws -> EmployeeLogin
}

public class EmployeeLoginRepositoryImpl: EmployeeLoginRepository {
    
    private let employeeLoginRemoteDataSource: EmployeeLoginRemoteDataSource
    
    public init(employeeLoginRemoteDataSource: EmployeeLoginRemoteDataSource) {
        self.employeeLoginRemoteDataSource = employeeLoginRemoteDataSource
    }
    
    public func loginEmployee(pin: String) async throws -> EmployeeLogin {
        let request = EmployeeLoginRequest(pin: pin)
        let dto = try await employeeLoginRemoteDataSource.loginEmployee(request: request)
        
        return EmployeeLogin(
            id: dto.id_user,
            name: "\(dto.first_name) \(dto.last_name)",
            role : dto.role,
            token: dto.access_token,
            refreshToken: dto.refresh_token
        )
    }
}

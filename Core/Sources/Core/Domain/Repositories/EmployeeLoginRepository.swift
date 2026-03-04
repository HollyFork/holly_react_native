import Foundation

public protocol EmployeeLoginRepository {
    func loginEmployee(pin: String, deviceToken: String) async throws -> EmployeeLogin
}
import Foundation

public class EmployeeLoginRepositoryImpl: EmployeeLoginRepository {
    
    private let remoteDataSource: EmployeeLoginRemoteDataSource
    
    public init(remoteDataSource: EmployeeLoginRemoteDataSource) {
        self.remoteDataSource = remoteDataSource
    }
    
    public func loginEmployee(pin: String, deviceToken: String) async throws -> EmployeeLogin {
        let request = EmployeeLoginRequest(pin: pin, deviceToken: deviceToken)
        let response = try await remoteDataSource.loginEmployee(request: request)
        
        // ✅ FIX : Sauvegarde des tokens dans Keychain (indispensable pour le refresh)
        _ = KeychainManager.shared.saveToken(response.access_token)
        _ = KeychainManager.shared.saveRefreshToken(response.refresh_token)
        
        // Sauvegarde dans SessionCache
        SessionCache.shared.employeeId = response.employee_id
        SessionCache.shared.employeeName = response.employee_name
        SessionCache.shared.employeeFirstName = response.employee_first_name
        SessionCache.shared.employeeLastName = response.employee_last_name
        SessionCache.shared.employeeRole = response.employee_type
        SessionCache.shared.employeeTypeId = response.employee_type_id
        SessionCache.shared.restaurantId = response.restaurant_id
        SessionCache.shared.restaurantName = response.restaurant_name
        SessionCache.shared.accessToken = response.access_token
        SessionCache.shared.refreshToken = response.refresh_token
        
        // Démarrage du rafraîchissement automatique du token
        TokenRefresher.shared.startRefreshing()
        
        return EmployeeLogin(
            id: response.employee_id,
            name: "\(response.employee_first_name) \(response.employee_last_name)",
            role: response.employee_type,
            token: response.access_token,
            refreshToken: response.refresh_token
        )
    }
}

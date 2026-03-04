import Foundation


public protocol EmployeeLoginUseCase {
    func execute(pin: String, deviceToken: String) async throws -> EmployeeLogin
}

public class EmployeeLoginUseCaseImpl: EmployeeLoginUseCase {
    
    private let repository: EmployeeLoginRepository
    
    public init(repository: EmployeeLoginRepository) {
        self.repository = repository
    }
    
    public func execute(pin: String, deviceToken: String) async throws -> EmployeeLogin {
        return try await repository.loginEmployee(pin: pin, deviceToken: deviceToken)
    }
}

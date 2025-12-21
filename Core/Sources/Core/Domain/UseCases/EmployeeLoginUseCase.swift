import Foundation

public protocol EmployeeLoginUseCase {
    func execute(pin: String) async throws -> EmployeeLogin
}

public class EmployeeLoginUseCaseImpl: EmployeeLoginUseCase {
    
    private let employeeLoginRepository: EmployeeLoginRepository
    
    public init(employeeLoginRepository: EmployeeLoginRepository) {
        self.employeeLoginRepository = employeeLoginRepository
    }
    
    public func execute(pin: String) async throws -> EmployeeLogin {
        return try await employeeLoginRepository.loginEmployee(pin: pin)
    }
}

import Foundation
 
public protocol LoginUseCase {
    func execute(username: String, password: String) async throws -> UserSession
}

public class LoginUseCaseImpl: LoginUseCase {
    
    private let loginRepository: LoginRepository
    
    public init(loginRepository: LoginRepository) {
        self.loginRepository = loginRepository
    }
    
    public func execute(username: String, password: String) async throws -> UserSession {
        return try await loginRepository.login(username: username, password: password)
    }
}

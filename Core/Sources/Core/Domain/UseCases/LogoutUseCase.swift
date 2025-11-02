import Foundation

public protocol LogoutUseCase {
    func execute(completion: @escaping (Result<String, Error>) -> Void)
}

public class LogoutUseCaseImpl: LogoutUseCase {
    private let repository: LogoutRepository
    
    public init(repository: LogoutRepository) {
        self.repository = repository
    }
    
    public func execute(completion: @escaping (Result<String, Error>) -> Void) {
        repository.logout(completion: completion)
    }
}

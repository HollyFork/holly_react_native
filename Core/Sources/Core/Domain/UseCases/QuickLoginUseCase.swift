 

import Combine

public final class QuickLoginUseCase {

    private let repository: AuthRepositoryProtocol

    public init(repository: AuthRepositoryProtocol) {
        self.repository = repository
    }

    public func execute(pinCode: String) -> AnyPublisher<Session, AuthError> {
        repository.quickLogin(pinCode: pinCode)
    }
}

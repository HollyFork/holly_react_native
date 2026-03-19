 

public final class LogoutUseCase {

    private let keychainManager: KeychainManager

    public init(keychainManager: KeychainManager = .shared) {
        self.keychainManager = keychainManager
    }

    public func execute(completion: @escaping (Result<Void, Never>) -> Void) {
        keychainManager.clearAuthTokens()
        SessionManager.shared.clear()
        completion(.success(()))
    }
}

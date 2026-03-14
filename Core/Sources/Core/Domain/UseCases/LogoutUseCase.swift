//
//  LogoutUseCase.swift
//  Core
//
//  Created by Hadj Rabah on 14/03/2026.
//


public final class LogoutUseCase {

    private let keychainManager: KeychainManager

    public init(keychainManager: KeychainManager = .shared) {
        self.keychainManager = keychainManager
    }

    /// Synchrone — efface les tokens JWT (garde le deviceToken)
    public func execute(completion: @escaping (Result<Void, Never>) -> Void) {
        keychainManager.clearAuthTokens()
        SessionManager.shared.clear()
        completion(.success(()))
    }
}

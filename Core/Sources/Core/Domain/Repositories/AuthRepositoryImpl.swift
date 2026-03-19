

import Foundation
import Combine

final class AuthRepositoryImpl: AuthRepositoryProtocol {

    private let dataSource: AuthDataSource
    private let keychainManager: KeychainManager

    init(
        dataSource: AuthDataSource,
        keychainManager: KeychainManager = .shared
    ) {
        self.dataSource      = dataSource
        self.keychainManager = keychainManager
    }

    func deviceLogin(restaurantId: Int, pinRestaurant: String) -> AnyPublisher<DeviceSession, AuthError> {
        let request = DeviceLoginRequestDTO(
            restaurantId:  restaurantId,
            pinRestaurant: pinRestaurant
        )

        return dataSource.deviceLogin(request: request)
            .handleEvents(receiveOutput: { [weak self] dto in
                self?.keychainManager.saveDeviceToken(dto.deviceToken)
            })
            .map { $0.toDomain() }
            .eraseToAnyPublisher()
    }

    func quickLogin(pinCode: String) -> AnyPublisher<Session, AuthError> {
        guard let deviceToken = keychainManager.getDeviceToken() else {
            return Fail(error: AuthError.deviceNotConfigured).eraseToAnyPublisher()
        }

        let request = QuickLoginRequestDTO(deviceToken: deviceToken, pinCode: pinCode)

        return dataSource.quickLogin(request: request)
            .handleEvents(receiveOutput: { [weak self] dto in
                self?.keychainManager.saveToken(dto.accessToken)
                self?.keychainManager.saveRefreshToken(dto.refreshToken)
                SessionManager.shared.saveSession(dto.toDomain())
            })
            .map { $0.toDomain() }
            .eraseToAnyPublisher()
    }
}




import Combine

public protocol AuthRepositoryProtocol {
    func deviceLogin(restaurantId: Int, pinRestaurant: String) -> AnyPublisher<DeviceSession, AuthError>
    func quickLogin(pinCode: String)                           -> AnyPublisher<Session, AuthError>
}

 


import Combine

public final class DeviceLoginUseCase {

    private let repository: AuthRepositoryProtocol

    public init(repository: AuthRepositoryProtocol) {
        self.repository = repository
    }

    public func execute(restaurantId: Int, pinRestaurant: String) -> AnyPublisher<DeviceSession, AuthError> {
        repository.deviceLogin(restaurantId: restaurantId, pinRestaurant: pinRestaurant)
    }
}

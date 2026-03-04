import Foundation

public protocol DeviceLoginUseCase {
    func execute(restaurantId: Int, pin: String) async throws -> DeviceLoginResponse
}

public class DeviceLoginUseCaseImpl: DeviceLoginUseCase {
    
    private let repository: DeviceLoginRepository
    
    public init(repository: DeviceLoginRepository) {
        self.repository = repository
    }
    
    public func execute(restaurantId: Int, pin: String) async throws -> DeviceLoginResponse {
        let request = DeviceLoginRequest(restaurant_id: restaurantId, pin_restaurant: pin)
        return try await repository.login(request: request)
    }
}

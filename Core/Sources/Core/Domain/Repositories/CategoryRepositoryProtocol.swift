


import Combine

public protocol CategoryRepositoryProtocol {
    func getCategories(restaurantId: Int?) -> AnyPublisher<[Category], AuthError>
}

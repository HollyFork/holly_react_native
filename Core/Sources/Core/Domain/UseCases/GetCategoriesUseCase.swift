 
import Combine

public final class GetCategoriesUseCase {
    private let repository: CategoryRepositoryProtocol
    public init(repository: CategoryRepositoryProtocol) { self.repository = repository }

    public func execute(restaurantId: Int?) -> AnyPublisher<[Category], AuthError> {
        repository.getCategories(restaurantId: restaurantId)
    }
}

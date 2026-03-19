 

import Combine

public final class GetSallesUseCase {
    private let repository: SalleRepositoryProtocol
    public init(repository: SalleRepositoryProtocol) { self.repository = repository }

    public func execute(restaurantId: Int?) -> AnyPublisher<[Salle], AuthError> {
        repository.getSalles(restaurantId: restaurantId)
    }
}

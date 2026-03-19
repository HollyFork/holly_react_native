 

import Combine

public protocol SalleRepositoryProtocol {
    func getSalles(restaurantId: Int?) -> AnyPublisher<[Salle], AuthError>
}

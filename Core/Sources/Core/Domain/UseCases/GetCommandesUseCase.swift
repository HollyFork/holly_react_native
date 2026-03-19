 


import Combine

public final class GetCommandesUseCase {
    private let repository: CommandeRepositoryProtocol
    public init(repository: CommandeRepositoryProtocol) { self.repository = repository }

    public func execute(restaurantId: Int?, statut: String? = "EN_COURS") -> AnyPublisher<[Commande], AuthError> {
        repository.getCommandes(restaurantId: restaurantId, statut: statut)
    }
}

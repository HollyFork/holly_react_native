
import Combine

public protocol CommandeRepositoryProtocol {
    func getCommandes(restaurantId: Int?, statut: String?) -> AnyPublisher<[Commande], AuthError>
}

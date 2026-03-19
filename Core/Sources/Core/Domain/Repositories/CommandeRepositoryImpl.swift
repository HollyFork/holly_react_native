

import Foundation
import Combine

final class CommandeRepositoryImpl: CommandeRepositoryProtocol {
    private let dataSource: HomeDataSource
    init(dataSource: HomeDataSource) { self.dataSource = dataSource }

    func getCommandes(restaurantId: Int?, statut: String?) -> AnyPublisher<[Commande], AuthError> {
        dataSource.getCommandes(restaurantId: restaurantId, statut: statut)
            .map { $0.results.map { $0.toDomain() } }
            .eraseToAnyPublisher()
    }
}

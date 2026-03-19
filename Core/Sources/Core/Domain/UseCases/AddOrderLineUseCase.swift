 

import Foundation

public final class AddOrderLineUseCase {

    private let repository: OrderRepositoryProtocol

    public init(repository: OrderRepositoryProtocol) {
        self.repository = repository
    }

    public func execute(
        commandeId:      Int,
        articleId:       Int,
        quantity:        Int,
        awaitingService: Bool = false
    ) async throws -> OrderLine {
        try await repository.addOrderLine(
            commandeId:      commandeId,
            articleId:       articleId,
            quantity:        quantity,
            awaitingService: awaitingService
        )
    }
}

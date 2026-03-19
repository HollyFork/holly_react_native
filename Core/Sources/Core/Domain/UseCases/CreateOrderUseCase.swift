 

import Foundation

public final class CreateOrderUseCase {

    private let repository: OrderRepositoryProtocol

    public init(repository: OrderRepositoryProtocol) {
        self.repository = repository
    }

    public func execute(
        tableId:      Int,
        restaurantId: Int,
        createdById:  Int
    ) async throws -> Order {
        try await repository.createOrder(
            tableId:      tableId,
            restaurantId: restaurantId,
            createdById:  createdById
        )
    }
}

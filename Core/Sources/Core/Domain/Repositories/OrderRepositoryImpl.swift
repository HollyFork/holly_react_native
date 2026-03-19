
import Foundation

final class OrderRepositoryImpl: OrderRepositoryProtocol {

    private let dataSource: OrderRemoteDataSource

    init(dataSource: OrderRemoteDataSource) {
        self.dataSource = dataSource
    }

    func createOrder(tableId: Int, restaurantId: Int, createdById: Int) async throws -> Order {
        let dto = CreateOrderRequestDTO(
            createdById:   createdById,
            restaurantId:  restaurantId,
            tableId:       tableId,
            status:        "EN_COURS",
            priority:      "NORMAL",
            kitchenStatus: "PENDING"
        )
        return try await dataSource.createOrder(dto).toDomain()
    }

    func addOrderLine(
        commandeId:      Int,
        articleId:       Int,
        quantity:        Int,
        awaitingService: Bool
    ) async throws -> OrderLine {
        let dto = AddOrderLineRequestDTO(
            commandeId:      commandeId,
            quantity:        quantity,
            articleId:       articleId,
            awaitingService: awaitingService
        )
        return try await dataSource.addOrderLine(dto).toDomain()
    }
    
    func kitchenPrint(commandeId: Int) async throws {

        let dto = KitchenPrintRequestDTO(
            createdAt: ISO8601DateFormatter().string(from: Date()),
            status: "EN_COURS",
            kitchenStatus: "PENDING",
            priority: "NORMAL",
            createdById: SessionManager.shared.employeeId ?? 0,
            restaurantId: SessionManager.shared.restaurantId ?? 0,
            tableId: 0
        )

        try await dataSource.kitchenPrint(dto, commandeId: commandeId)
    }

}

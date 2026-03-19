
import Foundation

public protocol OrderRepositoryProtocol {
    func createOrder(
        tableId:      Int,
        restaurantId: Int,
        createdById:  Int
    ) async throws -> Order

    func addOrderLine(
        commandeId:      Int,
        articleId:       Int,
        quantity:        Int,
        awaitingService: Bool
    ) async throws -> OrderLine
    
    func kitchenPrint(commandeId: Int) async throws
}

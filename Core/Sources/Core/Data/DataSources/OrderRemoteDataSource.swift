
import Foundation

protocol OrderRemoteDataSource {
    func createOrder(_ dto: CreateOrderRequestDTO)       async throws -> OrderResponseDTO
    func addOrderLine(_ dto: AddOrderLineRequestDTO)     async throws -> OrderLineResponseDTO
    func kitchenPrint(_ dto: KitchenPrintRequestDTO, commandeId: Int) async throws
}

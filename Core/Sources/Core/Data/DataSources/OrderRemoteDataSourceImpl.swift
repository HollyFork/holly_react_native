
import Foundation

final class OrderRemoteDataSourceImpl: OrderRemoteDataSource {

    private let networkClient: NetworkClient

    init(networkClient: NetworkClient) {
        self.networkClient = networkClient
    }

    func createOrder(_ dto: CreateOrderRequestDTO) async throws -> OrderResponseDTO {
        try await networkClient.postAsync(endpoint: .createCommande, body: dto)
    }

    func addOrderLine(_ dto: AddOrderLineRequestDTO) async throws -> OrderLineResponseDTO {
        try await networkClient.postAsync(endpoint: .addLigneCommande, body: dto)
    }
    
    func kitchenPrint(_ dto: KitchenPrintRequestDTO, commandeId: Int) async throws {
        let _: EmptyResponse = try await networkClient.postAsync(
            endpoint: .kitchenPrint(id: commandeId),
            body: dto
        )
    }
   
}

public struct EmptyResponse: Decodable {}

import Foundation

final class TableActionDataSourceImpl: TableActionDataSource {

    private let networkClient: NetworkClient

    init(networkClient: NetworkClient) {
        self.networkClient = networkClient
    }

    func getTableById(tableId: Int) async throws -> TableDTO {
        try await networkClient.getAsync(
            endpoint: .tableDetail(id: tableId),
            queryItems: []
        )
    }

    func getSalles(restaurantId: Int) async throws -> SalleListDTO {
        try await networkClient.getAsync(
            endpoint: .salles,
            queryItems: [URLQueryItem(name: "restaurant_id", value: String(restaurantId))]
        )
    }

    func createTable(_ dto: CreateTableRequestDTO) async throws -> TableDTO {
        try await networkClient.postAsync(endpoint: .createTable, body: dto)
    }

    func getCommandesEnCours(tableId: Int) async throws -> CommandeEnCoursListDTO {
        try await networkClient.getAsync(
            endpoint: .commandes,
            queryItems: [
                URLQueryItem(name: "table_id", value: String(tableId)),
                URLQueryItem(name: "statut",   value: "EN_COURS")
            ]
        )
    }
}

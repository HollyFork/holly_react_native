import Foundation
import Combine

final class TableRepositoryImpl: TableRepositoryProtocol {

    private let homeDataSource:  HomeDataSource
    private let tableDataSource: TableActionDataSource

    init(homeDataSource: HomeDataSource, tableDataSource: TableActionDataSource) {
        self.homeDataSource  = homeDataSource
        self.tableDataSource = tableDataSource
    }

    func getTables(salleId: Int?) -> AnyPublisher<[Table], AuthError> {
        homeDataSource.getTables(salleId: salleId)
            .map { $0.results.map { $0.toDomain() } }
            .eraseToAnyPublisher()
    }

   
    func findOrCreateTable(tableId: Int) async throws -> TableDetail {
        let restaurantId = SessionManager.shared.restaurantId ?? 0

        let salleList    = try await tableDataSource.getSalles(restaurantId: restaurantId)
        
        do {
            let table        = try await tableDataSource.getTableById(tableId: tableId)
            let commandeList = try await tableDataSource.getCommandesEnCours(tableId: table.id)
            let commande     = commandeList.results.first

            let salleName = salleList.results
                .first { $0.id == table.salleId }
                .map    { $0.name }
                ?? "Salle \(table.salleId)"

            return TableDetail(
                id:                 table.id,
                numero:             table.numero,
                capacity:           table.capacity,
                isOccupied:         table.isOccupied,
                salleId:            table.salleId,
                salleName:          salleName,
                existingCommandeId: commande?.id,
                existingOrderItems: commande?.lines.map { $0.toDomain() } ?? []
            )

        } catch {
            guard let defaultSalle = salleList.results.first else {
                throw AuthError.serverError("Aucune salle disponible")
            }

            let createDTO = CreateTableRequestDTO(
                numero:             tableId,
                capacity:           4,
                reservedSeats:      0,
                isOccupied:         false,
                salleId:            defaultSalle.id,
                employeeInChargeId: SessionManager.shared.employeeId ?? 0,
                positionX:          0,
                positionY:          0
            )

            let newTable = try await tableDataSource.createTable(createDTO)

            return TableDetail(
                id:        newTable.id,
                numero:    newTable.numero,
                capacity:  newTable.capacity,
                isOccupied: newTable.isOccupied,
                salleId:   newTable.salleId,
                salleName: defaultSalle.name
            )
        }
    }

}


 

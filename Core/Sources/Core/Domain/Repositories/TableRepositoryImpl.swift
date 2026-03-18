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

        do {
            let table = try await tableDataSource.getTableById(tableId: tableId)
            let numero = SessionManager.shared.restaurantId ?? 0


            let commandeList = try await tableDataSource.getCommandesEnCours(tableId: table.id)
            let commande     = commandeList.results.first

            return TableDetail(
                id:                 table.id,
                numero:             table.numero,
                capacity:           table.capacity,
                isOccupied:         table.isOccupied,
                salleId:            table.salle.id,
                salleName:          table.salle.name,
                existingCommandeId: commande?.id,
                existingOrderItems: commande?.lignes.map { $0.toDomain() } ?? []
            )

        } catch {
            // 2️⃣ 404 → crée la table
            //print("⚠️ Table id:\(numero) introuvable — création...")

            let restaurantId = SessionManager.shared.restaurantId ?? 0

            let salleList = try await tableDataSource.getSalles(restaurantId: restaurantId)

            guard let defaultSalle = salleList.results.first else {
                throw AuthError.serverError("Aucune salle disponible")
            }

            let createDTO = CreateTableRequestDTO(
                numero:             restaurantId,
                capacity:           4,
                reservedSeats:      0,
                isOccupied:         false,
                salleId:            defaultSalle.id,
                employeeInChargeId: SessionManager.shared.employeeId ?? 0,
                positionX:          0,
                positionY:          0
            )

            let newTable = try await tableDataSource.createTable(createDTO)
            print("✅ restaurantId \(restaurantId) créée — id: \(newTable.id)")

            return TableDetail(
                id:        newTable.id,
                numero:    newTable.numero,
                capacity:  newTable.capacity,
                isOccupied: newTable.isOccupied,
                salleId:   newTable.salle.id,
                salleName: newTable.salle.name
            )
        }
    }
}

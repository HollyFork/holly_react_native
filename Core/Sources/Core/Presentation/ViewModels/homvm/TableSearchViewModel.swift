import Foundation

@MainActor
public final class TableSearchViewModel: ObservableObject {

    @Published public var uiState: TableSearchUiState = .idle

    private let networkClient = DependencyContainer.shared.networkClient

    public init() {}

    public func searchTable(id: Int) async {
        guard id > 0 else {
            uiState = .error("ID invalide")
            return
        }
        uiState = .loading

        do {
            // ✅ GET /api/tables/{id}/
            let table: TableDTO = try await networkClient.getAsync(
                endpoint: .tableDetail(id: id),
                queryItems: []
            )
            print("✅ Table trouvée — id: \(table.id), numero: \(table.numero)")

            // Commandes EN_COURS
            let commandeList: CommandeEnCoursListDTO = try await networkClient.getAsync(
                endpoint: .commandes,
                queryItems: [
                    URLQueryItem(name: "table_id", value: String(table.id)),
                    URLQueryItem(name: "statut",   value: "EN_COURS")
                ]
            )
            let commande = commandeList.results.first

            uiState = .found(TableDetail(
                id:                 table.id,
                numero:             table.numero,
                capacity:           table.capacity,
                isOccupied:         table.isOccupied,
                salleId:            table.salle.id,
                salleName:          table.salle.name,
                existingCommandeId: commande?.id,
                existingOrderItems: commande?.lignes.map { $0.toDomain() } ?? []
            ))

        } catch {
            // ❌ 404 → crée la table
            print("⚠️ Table \(id) introuvable — création...")
            await createTable(numero: id)
        }
    }

    private func createTable(numero: Int) async {
        let restaurantId = SessionManager.shared.restaurantId ?? 0

        do {
            // Récupère la première salle
            let salleList: SalleListDTO = try await networkClient.getAsync(
                endpoint: .salles,
                queryItems: [URLQueryItem(name: "restaurant_id", value: String(restaurantId))]
            )

            guard let defaultSalle = salleList.results.first else {
                uiState = .error("Aucune salle disponible")
                return
            }

            let dto = CreateTableRequestDTO(
                numero:             numero,
                capacity:           4,
                reservedSeats:      0,
                isOccupied:         false,
                salleId:            defaultSalle.id,
                employeeInChargeId: SessionManager.shared.employeeId ?? 0,
                positionX:          0,
                positionY:          0
            )

            let newTable: TableDTO = try await networkClient.postAsync(
                endpoint: .createTable,
                body: dto
            )
            print("✅ Table \(numero) créée — id: \(newTable.id)")

            uiState = .found(TableDetail(
                id:        newTable.id,
                numero:    newTable.numero,
                capacity:  newTable.capacity,
                isOccupied: newTable.isOccupied,
                salleId:   newTable.salle.id,
                salleName: newTable.salle.name
            ))

        } catch let error as AuthError {
            uiState = .error(error.errorDescription ?? "Erreur création table")
        } catch {
            uiState = .error(error.localizedDescription)
        }
    }

    public func reset() { uiState = .idle }
}

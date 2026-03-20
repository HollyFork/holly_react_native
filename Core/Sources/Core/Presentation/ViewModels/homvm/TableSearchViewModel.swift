import Foundation

@MainActor
public final class TableSearchViewModel: ObservableObject {

    @Published public var uiState: TableSearchUiState = .idle

    private let networkClient = DependencyContainer.shared.networkClient

    public init() {}

    public func searchTable(numero: Int) async {
        guard numero > 0 else { uiState = .error("Numéro invalide"); return }
        uiState = .loading

        do {
            let allTables = try await fetchTablesIfNeeded()

            if let table = allTables.first(where: { $0.numero == numero }) {

                let salleName = SessionManager.shared.currentSalleList
                    .first { $0.id == table.salleId }?
                    .name ?? "Salle \(table.salleId)"

                let commandeList: CommandeEnCoursListDTO = try await networkClient.getAsync(
                    endpoint: .commandes,
                    queryItems: [
                        URLQueryItem(name: "table_id",      value: String(table.id)),
                        URLQueryItem(name: "statut",        value: "EN_COURS"),
                        URLQueryItem(name: "restaurant_id", value: String(SessionManager.shared.restaurantId ?? 0))
                    ]
                )
                let commande = commandeList.results.first

                uiState = .found(TableDetail(
                    id:                 table.id,
                    numero:             table.numero,
                    capacity:           table.capacity,
                    isOccupied:         table.isOccupied,
                    salleId:            table.salleId,
                    salleName:          salleName,
                    existingCommandeId: commande?.id,
                    existingOrderItems: commande?.lines.map { $0.toDomain() } ?? []
                ))

            } else {
                let defaultSalle = SessionManager.shared.currentSalleList.first
                await createTable(numero: numero, defaultSalle: defaultSalle)
            }

        } catch let error as AuthError {
            uiState = .error(error.errorDescription ?? "Erreur réseau")
        } catch {
            uiState = .error(error.localizedDescription)
        }
    }

    private func fetchTablesIfNeeded() async throws -> [Table] {
        if !SessionManager.shared.currentTableList.isEmpty {
            return SessionManager.shared.currentTableList
        }

        let restaurantId = SessionManager.shared.restaurantId ?? 0

        let salleList: SalleListDTO = try await networkClient.getAsync(
            endpoint: .salles,
            queryItems: [URLQueryItem(name: "restaurant_id", value: String(restaurantId))]
        )

        guard !salleList.results.isEmpty else {
            throw AuthError.serverError("Aucune salle disponible")
        }

        SessionManager.shared.cacheSalles(salleList.results.map { $0.toDomain() })

        let allTables = try await withThrowingTaskGroup(of: [Table].self) { group in
            for salle in salleList.results {
                group.addTask { [networkClient = self.networkClient] in
                    var salleTables: [Table] = []
                    var page: Int? = nil

                    repeat {
                        var items = [URLQueryItem(name: "salle_id", value: String(salle.id))]
                        if let p = page {
                            items.append(URLQueryItem(name: "page", value: String(p)))
                        }

                        let list: TableListDTO = try await networkClient.getAsync(
                            endpoint: .tables,
                            queryItems: items
                        )

                        salleTables += list.results.map { $0.toDomain() }

                        if let nextURL = list.next,
                           let url = URL(string: nextURL),
                           let pageVal = URLComponents(url: url, resolvingAgainstBaseURL: false)?
                               .queryItems?.first(where: { $0.name == "page" })?.value,
                           let nextPage = Int(pageVal) {
                            page = nextPage
                        } else {
                            page = nil
                        }
                    } while page != nil

                    return salleTables
                }
            }
            var merged: [Table] = []
            for try await batch in group { merged += batch }
            return merged
        }

        SessionManager.shared.cacheTables(allTables)
        return allTables
    }

    private func createTable(numero: Int, defaultSalle: Salle?) async {
        let restaurantId = SessionManager.shared.restaurantId ?? 0

        do {
            let salle: Salle
            if let cached = defaultSalle {
                salle = cached
            } else {
                let salleList: SalleListDTO = try await networkClient.getAsync(
                    endpoint: .salles,
                    queryItems: [URLQueryItem(name: "restaurant_id", value: String(restaurantId))]
                )
                guard let first = salleList.results.first else {
                    uiState = .error("Aucune salle disponible")
                    return
                }
                salle = first.toDomain()
            }

            let dto = CreateTableRequestDTO(
                numero:             numero,
                capacity:           4,
                reservedSeats:      0,
                isOccupied:         false,
                salleId:            salle.id,
                employeeInChargeId: SessionManager.shared.employeeId ?? 0,
                positionX:          0,
                positionY:          0
            )

            let newTable: TableDTO = try await networkClient.postAsync(
                endpoint: .createTable,
                body: dto
            )

            SessionManager.shared.clearTableCache()

            uiState = .found(TableDetail(
                id:        newTable.id,
                numero:    newTable.numero,
                capacity:  newTable.capacity,
                isOccupied: newTable.isOccupied,
                salleId:   newTable.salleId,
                salleName: salle.name
            ))

        } catch let error as AuthError {
            uiState = .error(error.errorDescription ?? "Erreur création table")
        } catch {
            uiState = .error(error.localizedDescription)
        }
    }

    public func reset() { uiState = .idle }
}



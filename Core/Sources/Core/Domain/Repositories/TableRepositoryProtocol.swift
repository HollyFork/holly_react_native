import Combine
import Foundation

public protocol TableRepositoryProtocol {
    // Combine — pour HomeViewModel
    func getTables(salleId: Int?) -> AnyPublisher<[Table], AuthError>

    func findOrCreateTable(tableId: Int) async throws -> TableDetail

}

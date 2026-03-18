import Foundation

public final class FindOrCreateTableUseCase {
    private let repository: TableRepositoryProtocol
    public init(repository: TableRepositoryProtocol) { self.repository = repository }

    public func execute(tableId: Int) async throws -> TableDetail {
        try await repository.findOrCreateTable(tableId: tableId)
    }
}

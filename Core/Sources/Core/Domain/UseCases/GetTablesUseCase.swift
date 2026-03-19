 


import Combine

public final class GetTablesUseCase {
    private let repository: TableRepositoryProtocol
    public init(repository: TableRepositoryProtocol) { self.repository = repository }

    public func execute(salleId: Int?) -> AnyPublisher<[Table], AuthError> {
        repository.getTables(salleId: salleId)
    }
}

 
public final class KitchenPrintUseCase {

    private let repository: OrderRepositoryProtocol

    public init(repository: OrderRepositoryProtocol) {
        self.repository = repository
    }

    public func execute(commandeId: Int) async throws {
        try await repository.kitchenPrint(commandeId: commandeId)
    }
}

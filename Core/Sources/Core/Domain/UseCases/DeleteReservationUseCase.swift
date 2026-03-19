 


import Combine

public final class DeleteReservationUseCase {
    private let repository: ReservationRepositoryProtocol
    public init(repository: ReservationRepositoryProtocol) { self.repository = repository }

    public func execute(id: Int) -> AnyPublisher<Void, AuthError> {
        repository.deleteReservation(id: id)
    }
}

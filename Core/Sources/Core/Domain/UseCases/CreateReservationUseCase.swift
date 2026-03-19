 

import Combine

public final class CreateReservationUseCase {
    private let repository: ReservationRepositoryProtocol
    public init(repository: ReservationRepositoryProtocol) { self.repository = repository }

    public func execute(_ request: CreateReservationRequest) -> AnyPublisher<Reservation, AuthError> {
        repository.createReservation(request)
    }
}

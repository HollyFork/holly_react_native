
import Foundation
import Combine

final class ReservationRepositoryImpl: ReservationRepositoryProtocol {

    private let dataSource: HomeDataSource
    init(dataSource: HomeDataSource) { self.dataSource = dataSource }

    func getReservations(restaurantId: Int?, date: String?) -> AnyPublisher<[Reservation], AuthError> {
        dataSource.getReservations(restaurantId: restaurantId, date: date)
            .map { $0.results.compactMap { $0.toDomain() } }
            .eraseToAnyPublisher()
    }

    func getReservation(id: Int) -> AnyPublisher<Reservation, AuthError> {
        dataSource.getReservation(id: id)
            .tryMap { dto -> Reservation in
                guard let r = dto.toDomain() else { throw AuthError.decodingError }
                return r
            }
            .mapError { ($0 as? AuthError) ?? .unknown }
            .eraseToAnyPublisher()
    }

    func createReservation(_ request: CreateReservationRequest) -> AnyPublisher<Reservation, AuthError> {
        let dto = ReservationRequestDTO.from(request)
        return dataSource.createReservation(dto)
            .tryMap { dto -> Reservation in
                guard let r = dto.toDomain() else { throw AuthError.decodingError }
                return r
            }
            .mapError { ($0 as? AuthError) ?? .unknown }
            .eraseToAnyPublisher()
    }

    func updateReservation(id: Int, _ request: CreateReservationRequest) -> AnyPublisher<Reservation, AuthError> {
        let dto = ReservationRequestDTO.from(request)
        return dataSource.updateReservation(id: id, dto)
            .tryMap { dto -> Reservation in
                guard let r = dto.toDomain() else { throw AuthError.decodingError }
                return r
            }
            .mapError { ($0 as? AuthError) ?? .unknown }
            .eraseToAnyPublisher()
    }

    func deleteReservation(id: Int) -> AnyPublisher<Void, AuthError> {
        dataSource.deleteReservation(id: id)
    }
}

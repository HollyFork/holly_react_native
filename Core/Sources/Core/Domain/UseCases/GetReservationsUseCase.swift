//
//  GetReservationsUseCase.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Combine

public final class GetReservationsUseCase {
    private let repository: ReservationRepositoryProtocol
    public init(repository: ReservationRepositoryProtocol) { self.repository = repository }

    public func execute(restaurantId: Int?, date: String? = nil) -> AnyPublisher<[Reservation], AuthError> {
        repository.getReservations(restaurantId: restaurantId, date: date)
    }
}

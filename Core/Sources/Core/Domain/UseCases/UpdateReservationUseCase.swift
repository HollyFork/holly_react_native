//
//  UpdateReservationUseCase.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Combine

public final class UpdateReservationUseCase {
    private let repository: ReservationRepositoryProtocol
    public init(repository: ReservationRepositoryProtocol) { self.repository = repository }

    public func execute(id: Int, _ request: CreateReservationRequest) -> AnyPublisher<Reservation, AuthError> {
        repository.updateReservation(id: id, request)
    }
}
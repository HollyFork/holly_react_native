//
//  ReservationRepositoryProtocol.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Combine

public protocol ReservationRepositoryProtocol {
    func getReservations(restaurantId: Int?, date: String?) -> AnyPublisher<[Reservation], AuthError>
    func getReservation(id: Int)                            -> AnyPublisher<Reservation, AuthError>
    func createReservation(_ request: CreateReservationRequest) -> AnyPublisher<Reservation, AuthError>
    func updateReservation(id: Int, _ request: CreateReservationRequest) -> AnyPublisher<Reservation, AuthError>
    func deleteReservation(id: Int)                         -> AnyPublisher<Void, AuthError>
}

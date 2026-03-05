//
//  ReservationRepository.swift
//  Core
//
//  Created by Hadj Rabah on 04/03/2026.
//


public protocol ReservationRepository {
    func getReservations(restaurantId: Int, date: Date) async throws -> [Reservation]
}
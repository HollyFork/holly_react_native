//
//  ReservationRemoteDataSource.swift
//  Core
//
//  Created by Hadj Rabah on 04/03/2026.
//


public protocol ReservationRemoteDataSource {
    func getReservations(restaurantId: Int, date: String) async throws -> [ReservationResponse]
}
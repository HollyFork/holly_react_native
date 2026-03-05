//
//  GetReservationsUseCase.swift
//  Core
//
//  Created by Hadj Rabah on 04/03/2026.
//


import Foundation

public protocol GetReservationsUseCase {
    func execute(restaurantId: Int, date: Date) async throws -> [Reservation]
}
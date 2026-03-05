//
//  ReservationUiState.swift
//  Core
//
//  Created by Hadj Rabah on 04/03/2026.
//


import Foundation

enum ReservationUiState: Equatable {
    case idle
    case loading
    case success([Reservation])
    case error(String)
}
//
//  ReservationRepository 2.swift
//  Core
//
//  Created by Hadj Rabah on 05/03/2026.
//


// Core/Domain/Repositories/ReservationRepository.swift
import Foundation

public protocol ReservationRepository {
    func getReservations(
        restaurantId: Int?,
        date: Date?,
        roomId: Int?
    ) async throws -> [Reservation]

    func updateReservation(
        id: Int,
        body: ReservationUpdateRequest
    ) async throws -> Reservation
}

public class ReservationRepositoryImpl: ReservationRepository {
    private let remoteDataSource: ReservationRemoteDataSource

    public init(remoteDataSource: ReservationRemoteDataSource) {
        self.remoteDataSource = remoteDataSource
    }

    public func getReservations(
        restaurantId: Int?,
        date: Date?,
        roomId: Int?
    ) async throws -> [Reservation] {
        return try await remoteDataSource.fetchReservations(
            restaurantId: restaurantId,
            date: date,
            roomId: roomId
        )
    }

    public func updateReservation(
        id: Int,
        body: ReservationUpdateRequest
    ) async throws -> Reservation {
        return try await remoteDataSource.updateReservation(id: id, body: body)
    }
}
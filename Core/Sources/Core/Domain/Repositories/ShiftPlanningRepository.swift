//
//  ShiftPlanningRepository.swift
//  Core
//
//  Created by Hadj Rabah on 06/03/2026.
//


import Foundation

public protocol ShiftPlanningRepository {
    func getPlanning(
        employeeId: Int,
        restaurantId: Int?,
        week: String
    ) async throws -> ShiftPlanning
}

public class ShiftPlanningRepositoryImpl: ShiftPlanningRepository {

    private let remoteDataSource: ShiftPlanningRemoteDataSource

    public init(remoteDataSource: ShiftPlanningRemoteDataSource) {
        self.remoteDataSource = remoteDataSource
    }

    public func getPlanning(
        employeeId: Int,
        restaurantId: Int?,
        week: String
    ) async throws -> ShiftPlanning {

        try await remoteDataSource.fetchPlanning(
            employeeId: employeeId,
            restaurantId: restaurantId,
            week: week
        )
    }
}
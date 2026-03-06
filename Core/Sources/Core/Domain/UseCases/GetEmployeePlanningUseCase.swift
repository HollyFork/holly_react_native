//
//  GetEmployeePlanningUseCase.swift
//  Core
//
//  Created by Hadj Rabah on 06/03/2026.
//


import Foundation

public protocol GetEmployeePlanningUseCase {
    func execute(
        employeeId: Int,
        restaurantId: Int?,
        week: String
    ) async throws -> ShiftPlanning
}

public class GetEmployeePlanningUseCaseImpl: GetEmployeePlanningUseCase {

    private let repository: ShiftPlanningRepository

    public init(repository: ShiftPlanningRepository) {
        self.repository = repository
    }

    public func execute(
        employeeId: Int,
        restaurantId: Int?,
        week: String
    ) async throws -> ShiftPlanning {

        try await repository.getPlanning(
            employeeId: employeeId,
            restaurantId: restaurantId,
            week: week
        )
    }
}
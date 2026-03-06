//
//  GetMyPlanningUseCase.swift
//  Core
//
//  Created by Hadj Rabah on 06/03/2026.
//


class GetMyPlanningUseCase {

    private let repository: PlanningRepository

    init(repository: PlanningRepository) {
        self.repository = repository
    }

    func execute(
        employeId: Int,
        restaurantId: Int?,
        week: String
    ) async throws -> Planning {

        try await repository.getMyPlanning(
            employeId: employeId,
            restaurantId: restaurantId,
            week: week
        )
    }
}
//
//  GetShiftsUseCase.swift
//  Core
//
//  Created by Hadj Rabah on 14/03/2026.
//


import Combine

public final class GetWeekPlanningUseCase {

    private let repository: PlanningRepositoryProtocol

    public init(repository: PlanningRepositoryProtocol) {
        self.repository = repository
    }

    public func execute(
        employeeId:  Int,
        restaurantId: Int? = nil,
        week: String? = nil
    ) -> AnyPublisher<WeekPlanning, AuthError> {
        let filter = PlanningFilter(
            employeeId:   employeeId,
            restaurantId: restaurantId,
            week:         week
        )
        return repository.getWeekPlanning(filter: filter)
    }
}

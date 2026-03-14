//
//  PlanningRepositoryImpl.swift
//  Core
//
//  Created by Hadj Rabah on 14/03/2026.
//

import Foundation
import Combine

final class PlanningRepositoryImpl: PlanningRepositoryProtocol {

    private let dataSource: PlanningDataSource

    init(dataSource: PlanningDataSource) {
        self.dataSource = dataSource
    }

    func getWeekPlanning(filter: PlanningFilter) -> AnyPublisher<WeekPlanning, AuthError> {
        dataSource.getEmploiDuTemps(filter: filter)
            .map { $0.toDomain() }
            .eraseToAnyPublisher()
    }
}

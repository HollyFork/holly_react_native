

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

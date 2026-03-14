import Combine

public protocol PlanningRepositoryProtocol {
    func getWeekPlanning(filter: PlanningFilter) -> AnyPublisher<WeekPlanning, AuthError>
}

import Combine

public final class GetWeekPlanningUseCase {
    private let repository: PlanningRepositoryProtocol
    public init(repository: PlanningRepositoryProtocol) { self.repository = repository }

    public func execute(filter: PlanningFilter) -> AnyPublisher<WeekPlanning, AuthError> {
        repository.getWeekPlanning(filter: filter)
    }
}

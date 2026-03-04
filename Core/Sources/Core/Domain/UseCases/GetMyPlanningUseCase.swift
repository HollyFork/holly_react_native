import Foundation


public protocol GetMyPlanningUseCase {
    func execute(employeeId: Int?, restaurantId: Int?, week: String?) async throws -> [ShiftResponse]
}

public class GetMyPlanningUseCaseImpl: GetMyPlanningUseCase {
    private let repository: PlanningRepository

    public init(repository: PlanningRepository) {
        self.repository = repository
    }

    public func execute(employeeId: Int?, restaurantId: Int?, week: String?) async throws -> [ShiftResponse] {
        return try await repository.getShifts(employeeId: employeeId, restaurantId: restaurantId, week: week)
    }
}

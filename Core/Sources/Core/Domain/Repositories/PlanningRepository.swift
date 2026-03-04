import Foundation


public protocol PlanningRepository {
    func getShifts(employeeId: Int?, restaurantId: Int?, week: String?) async throws -> [ShiftResponse]
}

public class PlanningRepositoryImpl: PlanningRepository {
    private let remote: PlanningRemoteDataSource

    public init(remote: PlanningRemoteDataSource) {
        self.remote = remote
    }

    public func getShifts(employeeId: Int?, restaurantId: Int?, week: String?) async throws -> [ShiftResponse] {
        return try await remote.getShifts(employeeId: employeeId, restaurantId: restaurantId, week: week)
    }
}

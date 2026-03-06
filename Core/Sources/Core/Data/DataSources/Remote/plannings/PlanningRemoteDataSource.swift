protocol PlanningRemoteDataSource {
    func getPlanning(
        employeId: Int,
        restaurantId: Int?,
        week: String
    ) async throws -> PlanningDto
}
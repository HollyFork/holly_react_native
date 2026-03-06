protocol PlanningRepository {
    func getMyPlanning(
        employeId: Int,
        restaurantId: Int?,
        week: String
    ) async throws -> Planning
}
import Foundation

public struct ShiftPlanning {
    public let restaurant: PlanningRestaurant
    public let semaine: PlanningWeek
    public let jours: [PlanningDay]
    public let totalWeekHours: Double

    public init(
        restaurant: PlanningRestaurant,
        semaine: PlanningWeek,
        jours: [PlanningDay],
        totalWeekHours: Double
    ) {
        self.restaurant = restaurant
        self.semaine = semaine
        self.jours = jours
        self.totalWeekHours = totalWeekHours
    }
}

public struct PlanningRestaurant {
    public let id: Int
    public let name: String
}

public struct PlanningWeek {
    public let start: Date
    public let end: Date
}

public struct PlanningDay: Identifiable {
    public let id = UUID()
    public let date: Date
    public let dayName: String
    public let shifts: [PlanningShift]
    public let totalHours: Double
}

public struct PlanningShift: Identifiable {
    public let id = UUID()
    public let start: Date
    public let end: Date
}
import Foundation

public struct PlanningFilter {
    public let employeeId:   Int
    public let restaurantId: Int
    public let date:         String?
    public let week:         String?

    public init(
        employeeId:   Int,
        restaurantId: Int,
        date:         String? = nil,
        week:         String? = nil
    ) {
        self.employeeId   = employeeId
        self.restaurantId = restaurantId
        self.date         = date
        self.week         = week
    }

    var queryItems: [URLQueryItem] {
        var items: [URLQueryItem] = [
            URLQueryItem(name: "employe_id",   value: String(employeeId)),
            URLQueryItem(name: "restaurant_id", value: String(restaurantId))
        ]
        if let date { items.append(URLQueryItem(name: "date", value: date)) }
        else if let week { items.append(URLQueryItem(name: "week", value: week)) }
        return items
    }

    public static func currentWeek(employeeId: Int, restaurantId: Int) -> PlanningFilter {
        let formatter = DateFormatter()
        formatter.dateFormat = "YYYY-'W'ww"
        formatter.locale = Locale(identifier: "fr_FR")
        return PlanningFilter(
            employeeId:   employeeId,
            restaurantId: restaurantId,
            week:         formatter.string(from: Date())
        )
    }
}

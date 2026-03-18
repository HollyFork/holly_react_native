
import Foundation

public struct PlanningFilter {
    public let employeeId:   Int
    public let restaurantId: Int?
    public let date:         String  // format: "2026-03-09"

    public init(
        employeeId:   Int,
        restaurantId: Int?    = nil,
        date:         String? = nil
    ) {
        self.employeeId   = employeeId
        self.restaurantId = restaurantId
        self.date         = date ?? PlanningFilter.today()
    }

    var queryItems: [URLQueryItem] {
        [
            URLQueryItem(name: "employe_id",    value: String(employeeId)),
            URLQueryItem(name: "date",          value: date),
            URLQueryItem(name: "restaurant_id", value: restaurantId.map(String.init))
        ]
        .filter { $0.value != nil && !($0.value?.isEmpty ?? true) }
    }

    // ✅ Date du jour au format YYYY-MM-DD
    private static func today() -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: Date())
    }
}

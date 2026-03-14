//
//  PlanningFilter.swift
//  Core
//
//  Created by Hadj Rabah on 14/03/2026.
//


import Foundation

public struct PlanningFilter {
    public let employeeId:  Int
    public let restaurantId: Int?
    public let week: String  // format ISO : "2026-W11"

    public init(employeeId: Int, restaurantId: Int? = nil, week: String? = nil) {
        self.employeeId   = employeeId
        self.restaurantId = restaurantId
        // Si pas de semaine fournie → semaine courante
        self.week = week ?? PlanningFilter.currentWeek()
    }

    var queryItems: [URLQueryItem] {
        [
            URLQueryItem(name: "employe_id",    value: String(employeeId)),
            URLQueryItem(name: "restaurant_id", value: restaurantId.map(String.init)),
            URLQueryItem(name: "week",          value: week)
        ]
    }

    // "2026-W11"
    private static func currentWeek() -> String {
        let calendar = Calendar(identifier: .iso8601)
        let now      = Date()
        let year     = calendar.component(.yearForWeekOfYear, from: now)
        let week     = calendar.component(.weekOfYear, from: now)
        return String(format: "%04d-W%02d", year, week)
    }
}
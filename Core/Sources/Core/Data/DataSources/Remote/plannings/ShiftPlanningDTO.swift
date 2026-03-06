//
//  ShiftPlanningDTO.swift
//  Core
//
//  Created by Hadj Rabah on 06/03/2026.
//


import Foundation

public struct ShiftPlanningDTO: Codable {
    public let restaurant: PlanningRestaurantDTO
    public let semaine: PlanningWeekDTO
    public let jours: [PlanningDayDTO]
    public let total_semaine_heures: Double

    public func toDomain() -> ShiftPlanning {
        ShiftPlanning(
            restaurant: restaurant.toDomain(),
            semaine: semaine.toDomain(),
            jours: jours.map { $0.toDomain() },
            totalWeekHours: total_semaine_heures
        )
    }
}

public struct PlanningRestaurantDTO: Codable {
    public let id: Int
    public let nom: String

    func toDomain() -> PlanningRestaurant {
        PlanningRestaurant(
            id: id,
            name: nom
        )
    }
}

public struct PlanningWeekDTO: Codable {
    public let debut: String
    public let fin: String

    func toDomain() -> PlanningWeek {
        let formatter = ISO8601DateFormatter()

        return PlanningWeek(
            start: formatter.date(from: debut) ?? Date(),
            end: formatter.date(from: fin) ?? Date()
        )
    }
}

public struct PlanningDayDTO: Codable {
    public let date: String
    public let jour: String
    public let creneaux: [PlanningShiftDTO]
    public let total_heures: Double

    func toDomain() -> PlanningDay {
        let formatter = ISO8601DateFormatter()

        return PlanningDay(
            date: formatter.date(from: date) ?? Date(),
            dayName: jour,
            shifts: creneaux.map { $0.toDomain() },
            totalHours: total_heures
        )
    }
}

public struct PlanningShiftDTO: Codable {
    public let debut: String
    public let fin: String

    func toDomain() -> PlanningShift {
        let formatter = ISO8601DateFormatter()

        return PlanningShift(
            start: formatter.date(from: debut) ?? Date(),
            end: formatter.date(from: fin) ?? Date()
        )
    }
}
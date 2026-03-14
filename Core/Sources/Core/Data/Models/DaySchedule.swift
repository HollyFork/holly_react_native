//
//  DaySchedule.swift
//  Core
//
//  Created by Hadj Rabah on 14/03/2026.
//


import Foundation

public struct DaySchedule: Identifiable, Equatable {
    public let id = UUID()
    public let date: Date
    public let morningSlot:   String?
    public let afternoonSlot: String?
    public let eveningSlot:   String?
    public let nightSlot:     String?
    
    let totalHours: Double

    public init(
        date: Date,
        morningSlot:   String? = nil,
        afternoonSlot: String? = nil,
        eveningSlot:   String? = nil,
        nightSlot:     String? = nil,
        totalHours: Double = 0
    ) {
        self.date          = date
        self.morningSlot   = morningSlot
        self.afternoonSlot = afternoonSlot
        self.eveningSlot   = eveningSlot
        self.nightSlot     = nightSlot
        self.totalHours = totalHours
    }

    public var dayNumber: String {
        let f = DateFormatter(); f.dateFormat = "d"; return f.string(from: date)
    }
    public var monthNumber: String {
        let f = DateFormatter(); f.dateFormat = "M"; return f.string(from: date)
    }
    public var displayDate: String {
            let formatter = DateFormatter()
            formatter.dateFormat = "dd/MM"
            return formatter.string(from: date)
        }
}

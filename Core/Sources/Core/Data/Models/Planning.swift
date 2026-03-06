//
//  Planning.swift
//  Core
//
//  Created by Hadj Rabah on 06/03/2026.
//


import Foundation

// MARK: - Domain Models

public struct Planning {
    public let restaurant: Restaurant
    public let semaine: Semaine
    public let jours: [PlanningDay]
    public let totalSemaineHeures: Int
}

public struct Restaurant {
    public let id: Int
    public let nom: String
}

public struct Semaine {
    public let debut: Date
    public let fin: Date
}

public struct PlanningDay: Identifiable {
    public let id = UUID()
    public let date: Date
    public let jour: String
    public let shifts: [Shift]
    public let totalHeures: Int
}

public struct Shift: Identifiable {
    public let id = UUID()
    public let start: Date
    public let end: Date
}

// MARK: - DTO → Domain Mapping

extension PlanningDto {
    func toDomain() -> Planning {
        let dateFormatter = ISO8601DateFormatter()
        
        let joursDomain = jours.map { jourDto -> PlanningDay in
            let shiftsDomain = jourDto.creneaux.compactMap { creneau -> Shift? in
                guard
                    let start = dateFormatter.date(from: creneau.debut),
                    let end = dateFormatter.date(from: creneau.fin)
                else { return nil }
                return Shift(start: start, end: end)
            }
            guard let jourDate = dateFormatter.date(from: jourDto.date) else {
                return PlanningDay(date: Date(), jour: jourDto.jour, shifts: shiftsDomain, totalHeures: jourDto.totalHeures)
            }
            return PlanningDay(date: jourDate, jour: jourDto.jour, shifts: shiftsDomain, totalHeures: jourDto.totalHeures)
        }
        
        let debutDate = dateFormatter.date(from: semaine.debut) ?? Date()
        let finDate = dateFormatter.date(from: semaine.fin) ?? Date()
        
        return Planning(
            restaurant: Restaurant(id: restaurant.id, nom: restaurant.nom),
            semaine: Semaine(debut: debutDate, fin: finDate),
            jours: joursDomain,
            totalSemaineHeures: totalSemaineHeures
        )
    }
}
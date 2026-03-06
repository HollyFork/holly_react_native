import Foundation

// MARK: - DTOs
public struct PlanningDto: Codable {
    let restaurant: RestaurantDto
    let semaine: WeekDto
    let jours: [DayDto]
    
    public struct RestaurantDto: Codable {
        let id: Int
        let nom: String
    }
    
    public struct WeekDto: Codable {
        let debut: String
        let fin: String
    }
    
    public struct DayDto: Codable {
        let date: String
        let jour: String
        let creneaux: [ShiftDto]
        let total_heures: Double
    }
    
    public struct ShiftDto: Codable {
        let debut: String
        let fin: String
    }
}

// MARK: - Extension pour conversion (AVEC IMPORT EXPLICITE)
extension PlanningDto {
    public func toDomain() -> Core.Planning {
        let dateFormatter = ISO8601DateFormatter()
        
        let domainDays = jours.compactMap { day -> Core.PlanningDay? in
            let shifts = day.creneaux.compactMap { shift -> Core.Shift? in
                guard let start = dateFormatter.date(from: shift.debut),
                      let end = dateFormatter.date(from: shift.fin) else { return nil }
                return Core.Shift(start: start, end: end)
            }
            guard let date = dateFormatter.date(from: day.date) else { return nil }
            return Core.PlanningDay(
                date: date, 
                jour: day.jour, 
                shifts: shifts, 
                totalHeures: Int(day.total_heures)
            )
        }
        
        let weekStart = dateFormatter.date(from: semaine.debut) ?? Date()
        let weekEnd = dateFormatter.date(from: semaine.fin) ?? Date()
        
        return Core.Planning(
            restaurant: Core.Restaurant(id: restaurant.id, nom: restaurant.nom),
            semaine: Core.Semaine(debut: weekStart, fin: weekEnd),
            jours: domainDays,
            totalSemaineHeures: 0 // À calculer si besoin
        )
    }
}

import Foundation

struct EmploiDuTempsResponseDTO: Decodable {
    let restaurant: RestaurantInfoDTO
    let semaine: SemaineDTO
    let jours: [JourDTO]
    let totalSemaineHeures: Double

    enum CodingKeys: String, CodingKey {
        case restaurant, semaine, jours
        case totalSemaineHeures = "total_semaine_heures"
    }
}

struct RestaurantInfoDTO: Decodable {
    let id: Int
    let nom: String
}

struct SemaineDTO: Decodable {
    let debut: String
    let fin: String
}

struct JourDTO: Decodable {
    let date: String
    let jour: String
    let creneaux: [CreneauDTO]
    let totalHeures: Double

    enum CodingKeys: String, CodingKey {
        case date, jour, creneaux
        case totalHeures = "total_heures"
    }
}

struct CreneauDTO: Decodable {
    let debut: String
    let fin: String
}

extension EmploiDuTempsResponseDTO {

    private static let dateFormatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "dd/MM"
        f.locale = Locale(identifier: "fr_FR")
        return f
    }()

    func toDomain() -> WeekPlanning {
        let days: [DaySchedule] = jours.map { jour in
            let date = Self.dateFormatter.date(from: jour.date) ?? Date()

            var morning:   String? = nil
            var afternoon: String? = nil
            var evening:   String? = nil
            var night:     String? = nil

            for creneau in jour.creneaux {
                let slot = "\(creneau.debut)\n\(creneau.fin)"
                let hour = Int(creneau.debut.prefix(2)) ?? 0
                switch hour {
                case 5..<12:  morning   = slot
                case 12..<17: afternoon = slot
                case 17..<22: evening   = slot
                default:      night     = slot
                }
            }

            return DaySchedule(
                date:          date,
                morningSlot:   morning,
                afternoonSlot: afternoon,
                eveningSlot:   evening,
                nightSlot:     night,
                totalHours:    jour.totalHeures
            )
        }

        return WeekPlanning(
            days:           days,
            totalWeekHours: totalSemaineHeures
        )
    }
}

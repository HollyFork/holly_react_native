//
//  ReservationResponse.swift
//  Core
//
//  Created by Hadj Rabah on 04/03/2026.
//

import Foundation


// DTO pour mapper le JSON en Entity
struct ReservationDTO: Codable {
    let id: Int
    let nom_client: String
    let nombre_personnes: Int
    let date_heure: String
    let telephone: String
    let salle_nom: String
    
    func toDomain() -> Reservation {
        let formatter = ISO8601DateFormatter()
        let date = formatter.date(from: date_heure) ?? Date()
        return Reservation(
            id: id,
            clientName: nom_client,
            numberOfPeople: nombre_personnes,
            dateTime: date,
            phone: telephone,
            roomName: salle_nom
        )
    }
}


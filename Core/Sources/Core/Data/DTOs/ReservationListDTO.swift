//
//  ReservationListDTO.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Foundation

struct ReservationListDTO: Decodable {
    let count: Int
    let results: [ReservationDTO]
}

struct ReservationDTO: Decodable {
    let id:          Int
    let clientName:  String
    let partySize:   Int
    let datetime:    String
    let phoneNumber: String?
    let salleId:     Int
    let salle:       SalleDTO
    let tableId:     Int?
    let table:       TableDTO?

    enum CodingKeys: String, CodingKey {
        case id, datetime, salle, table
        case clientName  = "client_name"
        case partySize   = "party_size"
        case phoneNumber = "phone_number"
        case salleId     = "salle_id"
        case tableId     = "table_id"
    }
}

extension ReservationDTO {
    private static let isoFormatter: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()
    private static let isoNoFrac: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime]
        return f
    }()

    func toDomain() -> Reservation? {
        let date = Self.isoFormatter.date(from: datetime)
                ?? Self.isoNoFrac.date(from: datetime)
        guard let date else { return nil }
        return Reservation(
            id:          id,
            clientName:  clientName,
            partySize:   partySize,
            datetime:    date,
            phoneNumber: phoneNumber,
            salleId:     salleId,
            salleName:   salle.name,
            tableId:     tableId,
            tableNumero: table?.numero
        )
    }
}
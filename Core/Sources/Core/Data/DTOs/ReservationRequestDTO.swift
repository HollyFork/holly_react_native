//
//  ReservationRequestDTO.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Foundation

struct ReservationRequestDTO: Encodable {
    let clientName:  String
    let partySize:   Int
    let datetime:    String
    let phoneNumber: String?
    let salleId:     Int
    let tableId:     Int?

    enum CodingKeys: String, CodingKey {
        case partySize   = "party_size"
        case phoneNumber = "phone_number"
        case salleId     = "salle_id"
        case tableId     = "table_id"
        case clientName  = "client_name"
        case datetime
    }

    private static let isoFormatter: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime]
        return f
    }()

    static func from(_ request: CreateReservationRequest) -> ReservationRequestDTO {
        ReservationRequestDTO(
            clientName:  request.clientName,
            partySize:   request.partySize,
            datetime:    isoFormatter.string(from: request.datetime),
            phoneNumber: request.phoneNumber,
            salleId:     request.salleId,
            tableId:     request.tableId
        )
    }
}

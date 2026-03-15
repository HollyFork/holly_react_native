//
//  TableListDTO.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


struct TableListDTO: Decodable {
    let count: Int
    let results: [TableDTO]
}

struct TableDTO: Decodable {
    let id:            Int
    let numero:        Int
    let capacity:      Int
    let reservedSeats: Int
    let isOccupied:    Bool
    let salleId:       Int
    let salle:         SalleDTO
    let positionX:     Int
    let positionY:     Int

    enum CodingKeys: String, CodingKey {
        case id, numero, capacity, salle
        case reservedSeats = "reserved_seats"
        case isOccupied    = "is_occupied"
        case salleId       = "salle_id"
        case positionX     = "position_x"
        case positionY     = "position_y"
    }
}

extension TableDTO {
    func toDomain() -> Table {
        Table(
            id:            id,
            numero:        numero,
            capacity:      capacity,
            reservedSeats: reservedSeats,
            isOccupied:    isOccupied,
            salleId:       salle.id,
            salleName:     salle.name,
            positionX:     positionX,
            positionY:     positionY
        )
    }
}
import Foundation

struct TableListDTO: Decodable {
    let count:    Int
    let next:     String?
    let previous: String?
    let results:  [TableDTO]
}

struct TableDTO: Decodable {
    let id:                 Int
    let numero:             Int
    let capacity:           Int
    let reservedSeats:      Int
    let isOccupied:         Bool
    let salleId:            Int
    let employeeInChargeId: Int?
    let positionX:          Int?
    let positionY:          Int?

    enum CodingKeys: String, CodingKey {
        case id, numero, capacity
        case reservedSeats      = "reserved_seats"
        case isOccupied         = "is_occupied"
        case salleId            = "salle_id"
        case employeeInChargeId = "employee_in_charge_id"
        case positionX          = "position_x"
        case positionY          = "position_y"
    }

    func toDomain() -> Table {
        Table(
            id:                 id,
            numero:             numero,
            capacity:           capacity,
            reservedSeats:      reservedSeats,   
            isOccupied:         isOccupied,
            salleId:            salleId,
            positionX:          positionX,
            positionY:          positionY,
            employeeInChargeId: employeeInChargeId
        )
    }
}

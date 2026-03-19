import Foundation

struct CreateTableRequestDTO: Encodable {
    let numero:             Int
    let capacity:           Int
    let reservedSeats:      Int
    let isOccupied:         Bool
    let salleId:            Int
    let employeeInChargeId: Int
    let positionX:          Int
    let positionY:          Int

    enum CodingKeys: String, CodingKey {
        case numero, capacity
        case reservedSeats      = "reserved_seats"
        case isOccupied         = "is_occupied"
        case salleId            = "salle_id"
        case employeeInChargeId = "employee_in_charge_id"
        case positionX          = "position_x"
        case positionY          = "position_y"
    }
}

struct CommandeEnCoursListDTO: Decodable {
    let count:   Int
    let next:    String?
    let results: [CommandeEnCoursDTO]
}

struct CommandeEnCoursDTO: Decodable {
    let id:            Int
    let lines:         [LigneCommandeDTO]
    let status:        String
    let tableId:       Int?
    let kitchenStatus: String
    let priority:      String
    let restaurantId:  Int
    let amount:        String
    let itemsCount:    Int
    let isInProgress:  Bool
    let createdAt:     String

    enum CodingKeys: String, CodingKey {
        case id, lines, status, amount, priority
        case tableId       = "table_id"
        case kitchenStatus = "kitchen_status"
        case restaurantId  = "restaurant_id"
        case itemsCount    = "items_count"
        case isInProgress  = "is_in_progress"
        case createdAt     = "created_at"
    }
}

struct LigneCommandeDTO: Decodable {
    let id:              Int
    let quantity:        Int
    let unitPrice:       String
    let articleId:       Int
    let articleName:     String
    let costOfGoodsSold: String
    let awaitingService: Bool

    enum CodingKeys: String, CodingKey {
        case id, quantity
        case unitPrice       = "unit_price"
        case articleId       = "article_id"
        case articleName     = "article_name"
        case costOfGoodsSold = "cost_of_goods_sold"
        case awaitingService = "awaiting_service"
    }

    func toDomain() -> OrderLine {
        OrderLine(
            id:              id,
            articleId:       articleId,
            articleName:     articleName,
            quantity:        quantity,
            unitPrice:       unitPrice,
            awaitingService: awaitingService,
            costOfGoodsSold: costOfGoodsSold
        )
    }
}

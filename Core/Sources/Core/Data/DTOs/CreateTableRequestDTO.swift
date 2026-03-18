import Foundation

// MARK: - Create Table Request
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

// MARK: - Commandes EN_COURS pour une table
struct CommandeEnCoursListDTO: Decodable {
    let count:   Int
    let results: [CommandeEnCoursDTO]
}



// MARK: - Ligne de commande (une seule déclaration)
struct LigneCommandeDTO: Decodable {
    let id:             Int
    let article:        ArticleInLigneDTO
    let quantity:       Int
    let unitPrice:      String
    let awaitingService: Bool

    enum CodingKeys: String, CodingKey {
        case id, article, quantity
        case unitPrice       = "unit_price"
        case awaitingService = "awaiting_service"
    }

    func toDomain() -> OrderLine {
        OrderLine(
            id:             id,
            articleId:      article.id,
            articleName:    article.name,
            articlePrice:   article.price,
            quantity:       quantity,
            unitPrice:      unitPrice,
            awaitingService: awaitingService
        )
    }
}

struct ArticleInLigneDTO: Decodable {
    let id:    Int
    let name:  String
    let price: String
}

struct CommandeEnCoursDTO: Decodable {
    let id:      Int
    let lignes:  [LigneCommandeDTO]
    let status:  String
    let tableId: Int?

    enum CodingKeys: String, CodingKey {
        case id, lignes, status
        case tableId = "table_id"
    }
}

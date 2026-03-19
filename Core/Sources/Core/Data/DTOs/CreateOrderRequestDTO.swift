import Foundation

struct CreateOrderRequestDTO: Encodable {
    let createdById:   Int
    let restaurantId:  Int
    let tableId:       Int
    let status:        String
    let priority:      String
    let kitchenStatus: String

    enum CodingKeys: String, CodingKey {
        case createdById   = "created_by_id"
        case restaurantId  = "restaurant_id"
        case tableId       = "table_id"
        case status
        case priority
        case kitchenStatus = "kitchen_status"
    }
}

struct OrderResponseDTO: Decodable {
    let id:         Int
    let tableId:    Int?
    let amount:     String
    let itemsCount: Int
    let status:     String

    enum CodingKeys: String, CodingKey {
        case id, amount, status
        case tableId    = "table_id"
        case itemsCount = "items_count"
    }

    func toDomain() -> Order {
        Order(
            id:         id,
            tableId:    tableId ?? 0,
            amount:     amount,
            itemsCount: itemsCount,
            status:     status
        )
    }
}

struct AddOrderLineRequestDTO: Encodable {
    let commandeId:      Int
    let quantity:        Int
    let articleId:       Int
    let awaitingService: Bool

    enum CodingKeys: String, CodingKey {
        case commandeId      = "commande_id"
        case quantity
        case articleId       = "article_id"
        case awaitingService = "awaiting_service"
    }
}


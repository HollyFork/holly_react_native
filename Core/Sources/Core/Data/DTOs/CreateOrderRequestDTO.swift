import Foundation

// MARK: - Create Order Request
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

// MARK: - Order Response
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

// MARK: - Add Line Request
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

// MARK: - Order Line Response
struct OrderLineResponseDTO: Decodable {
    let id:              Int
    let commande:        String
    let article:         ArticleInLigneDTO
    let quantity:        Int
    let unitPrice:       String
    let articleId:       Int
    let costOfGoodsSold: String
    let awaitingService: Bool

    enum CodingKeys: String, CodingKey {
        case id, commande, article, quantity
        case unitPrice       = "unit_price"
        case articleId       = "article_id"
        case costOfGoodsSold = "cost_of_goods_sold"
        case awaitingService = "awaiting_service"
    }

    func toDomain() -> OrderLine {
        OrderLine(
            id:              id,
            commandeId:      extractCommandeId(from: commande),
            articleId:       articleId,
            articleName:     article.name,
            articlePrice:    article.price,
            quantity:        quantity,
            unitPrice:       unitPrice,
            awaitingService: awaitingService,
            costOfGoodsSold: costOfGoodsSold
        )
    }

    private func extractCommandeId(from url: String) -> Int? {
        url.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
           .components(separatedBy: "/")
           .last
           .flatMap { Int($0) }
    }
}

// MARK: - Lignes list (GET /api/lignes-commandes/)
struct OrderLineListDTO: Decodable {
    let count:    Int
    let next:     String?
    let previous: String?
    let results:  [OrderLineResponseDTO]
}

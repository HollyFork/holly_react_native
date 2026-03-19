

import Foundation

struct OrderLineListDTO: Decodable {
    let count:    Int
    let next:     String?
    let previous: String?
    let results:  [OrderLineFlatDTO]
}

struct OrderLineFlatDTO: Decodable {
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
            articlePrice:    unitPrice,
            quantity:        quantity,
            unitPrice:       unitPrice,
            awaitingService: awaitingService,
            costOfGoodsSold: costOfGoodsSold
        )
    }
}

typealias OrderLineResponseDTO = OrderLineFlatDTO

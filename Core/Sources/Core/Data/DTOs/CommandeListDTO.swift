//
//  CommandeListDTO.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


struct CommandeListDTO: Decodable {
    let count: Int
    let results: [CommandeDTO]
}

struct CommandeDTO: Decodable {
    let id:              Int
    let itemsCount:      Int
    let amount:          String
    let status:          String
    let kitchenStatus:   String
    let priority:        String
    let restaurantId:    Int
    let tableId:         Int?
    let table:           TableDTO?
    let isInProgress:    Bool
    let createdAt:       String

    enum CodingKeys: String, CodingKey {
        case id, amount, status, priority, table
        case itemsCount    = "items_count"
        case kitchenStatus = "kitchen_status"
        case restaurantId  = "restaurant_id"
        case tableId       = "table_id"
        case isInProgress  = "is_in_progress"
        case createdAt     = "created_at"
    }
}

extension CommandeDTO {
    func toDomain() -> Commande {
        Commande(
            id:            id,
            itemsCount:    itemsCount,
            amount:        amount,
            status:        status,
            kitchenStatus: kitchenStatus,
            priority:      priority,
            tableId:       tableId,
            tableNumero:   table?.numero,
            restaurantId:  restaurantId,
            isInProgress:  isInProgress,
            createdAt:     createdAt
        )
    }
}
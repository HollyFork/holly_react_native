//
//  SalleListDTO.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


struct SalleListDTO: Decodable {
    let count: Int
    let results: [SalleDTO]
}

struct SalleDTO: Decodable {
    let id:          Int
    let name:        String
    let capacity:    Int
    let floor:       Int
    let description: String?
    let restaurant:  RestaurantDTO
}


struct RestaurantDTO: Decodable {
    let restaurantId: Int
    let name: String
    let city: String?

    enum CodingKeys: String, CodingKey {
        case name, city
        case restaurantId = "restaurant_id"
    }
}


extension SalleDTO {
    func toDomain() -> Salle {
        Salle(
            id:           id,
            name:         name,
            restaurantId: restaurant.restaurantId,
            capacity:     capacity,
            floor:        floor,
            description:  description
        )
    }
}

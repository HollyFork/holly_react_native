

import Foundation

struct SalleListDTO: Decodable {
    let count: Int
    let results: [SalleDTO]
}

struct SalleDTO: Decodable {
    let id: Int
    let name: String
    let description: String?
    let capacity: Int
    let floor: Int?
    let restaurantId: Int

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case description
        case capacity
        case floor
        case restaurantId = "restaurant_id"
    }

    func toDomain() -> Salle {
        Salle(
            id: id,
            name: name,
            description: description,
            capacity: capacity,
            floor: floor,
            restaurantId: restaurantId
        )
    }
}

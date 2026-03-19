
struct DeviceLoginRequestDTO: Encodable {
    let restaurantId: Int
    let pinRestaurant: String

    enum CodingKeys: String, CodingKey {
        case restaurantId   = "restaurant_id"
        case pinRestaurant  = "pin_restaurant"
    }
}

struct DeviceLoginResponseDTO: Decodable {
    let message: String
    let deviceToken: String
    let restaurantId: Int
    let restaurantName: String
    let restaurantVille: String

    enum CodingKeys: String, CodingKey {
        case message
        case deviceToken    = "device_token"
        case restaurantId   = "restaurant_id"
        case restaurantName = "restaurant_name"
        case restaurantVille = "restaurant_ville"
    }
}

extension DeviceLoginResponseDTO {
    func toDomain() -> DeviceSession {
        DeviceSession(
            deviceToken:    deviceToken,
            restaurantId:   restaurantId,
            restaurantName: restaurantName,
            restaurantVille: restaurantVille
        )
    }
}

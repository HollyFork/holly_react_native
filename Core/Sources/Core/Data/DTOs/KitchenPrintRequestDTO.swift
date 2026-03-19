

struct KitchenPrintRequestDTO: Encodable {
    let createdAt: String
    let status: String
    let kitchenStatus: String
    let priority: String
    let createdById: Int
    let restaurantId: Int
    let tableId: Int

    enum CodingKeys: String, CodingKey {
        case createdAt     = "created_at"
        case status
        case kitchenStatus = "kitchen_status"
        case priority
        case createdById   = "created_by_id"
        case restaurantId  = "restaurant_id"
        case tableId       = "table_id"
    }
}



struct CategoryListDTO: Decodable {
    let count:    Int
    let next:     String?
    let previous: String?
    let results:  [CategoryItemDTO]
}

struct CategoryItemDTO: Decodable {
    let id:           Int
    let name:         String
    let displayOrder: Int
    let description:  String?

    enum CodingKeys: String, CodingKey {
        case id, name, description
        case displayOrder = "display_order"
    }

    func toDomain() -> Category {
        Category(
            id:           id,
            name:         name,
            displayOrder: displayOrder,
            description:  description
        )
    }
}

public struct Article: Identifiable, Equatable {
    public let id: Int
    public let name: String
    public let categoryId: Int
    public let categoryName: String
    public let price: Double
    public let description: String?
    public let available: Bool

    public init(
        id: Int,
        name: String,
        categoryId: Int,
        categoryName: String,
        price: Double,
        description: String?,
        available: Bool
    ) {
        self.id = id
        self.name = name
        self.categoryId = categoryId
        self.categoryName = categoryName
        self.price = price
        self.description = description
        self.available = available
    }
}
//
//  ArticleDTO.swift
//  Core
//
//  Created by Hadj Rabah on 11/03/2026.
//


public struct ArticleDTO: Codable {

    public struct CategoryDTO: Codable {
        public let id: Int
        public let name: String
        public let display_order: Int
        public let description: String?
    }

    public let id: Int
    public let name: String
    public let categorie: CategoryDTO
    public let price: String
    public let description: String?
    public let available: Bool

    public func toDomain() -> Article {
        Article(
            id: id,
            name: name,
            categoryId: categorie.id,
            categoryName: categorie.name,
            price: Double(price) ?? 0,
            description: description,
            available: available
        )
    }
}

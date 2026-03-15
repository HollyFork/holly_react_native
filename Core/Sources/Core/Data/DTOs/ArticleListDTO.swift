//
//  ArticleListDTO.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Foundation

struct ArticleListDTO: Decodable {
    let count: Int
    let results: [ArticleDTO]
}

struct ArticleDTO: Decodable {
    let id:          Int
    let name:        String
    let price:       String
    let description: String?
    let available:   Bool
    let categorie:   CategoryDTO
}

struct CategoryDTO: Decodable {
    let id:           Int
    let name:         String
    let displayOrder: Int
    let description:  String?
    enum CodingKeys: String, CodingKey {
        case id, name, description
        case displayOrder = "display_order"
    }
}

extension ArticleDTO {
    func toDomain() -> Article {
        Article(
            id:           id,
            name:         name,
            price:        price,
            description:  description,
            available:    available,
            categoryId:   categorie.id,
            categoryName: categorie.name
        )
    }
}

extension CategoryDTO {
    func toDomain() -> Category {
        Category(id: id, name: name, displayOrder: displayOrder, description: description)
    }
}
//
//  CategoryDTO.swift
//  Core
//
//  Created by Hadj Rabah on 11/03/2026.
//


public struct CategoryDTO: Codable {
    public let id: Int
    public let nom: String
    public let ordre_affichage: Int
    public let description: String?
    public let restaurant_id: Int

    public func toDomain() -> Category {
        Category(
            id: id,
            name: nom,
            displayOrder: ordre_affichage,
            description: description,
            restaurantId: restaurant_id
        )
    }
}
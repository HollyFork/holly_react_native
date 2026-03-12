//
//  Category.swift
//  Core
//
//  Created by Hadj Rabah on 11/03/2026.
//


public struct Category: Identifiable, Equatable {
    public let id: Int
    public let name: String
    public let displayOrder: Int
    public let description: String?
    public let restaurantId: Int

    public init(
        id: Int,
        name: String,
        displayOrder: Int,
        description: String?,
        restaurantId: Int
    ) {
        self.id = id
        self.name = name
        self.displayOrder = displayOrder
        self.description = description
        self.restaurantId = restaurantId
    }
}
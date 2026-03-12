//
//  MenuRepository.swift
//  Core
//
//  Created by Hadj Rabah on 11/03/2026.
//


public protocol MenuRepository {
    func getCategories(restaurantId: Int) async throws -> [Category]
    func getArticles(restaurantId: Int) async throws -> [Article]
}
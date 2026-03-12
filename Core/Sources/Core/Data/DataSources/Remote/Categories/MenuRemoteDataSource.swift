//
//  MenuRemoteDataSource.swift
//  Core
//
//  Created by Hadj Rabah on 11/03/2026.
//


public protocol MenuRemoteDataSource {
    func fetchCategories(restaurantId: Int) async throws -> [Category]
    func fetchArticles(restaurantId: Int) async throws -> [Article]
}
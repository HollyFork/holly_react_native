//
//  CategoryRepositoryProtocol.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Combine

public protocol CategoryRepositoryProtocol {
    func getCategories(restaurantId: Int?) -> AnyPublisher<[Category], AuthError>
}
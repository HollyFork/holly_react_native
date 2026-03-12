//
//  GetCategoriesUseCase.swift
//  Core
//
//  Created by Hadj Rabah on 11/03/2026.
//


public protocol GetCategoriesUseCase {
    func execute(restaurantId: Int) async throws -> [Category]
}

public class GetCategoriesUseCaseImpl: GetCategoriesUseCase {

    private let repository: MenuRepository

    public init(repository: MenuRepository) {
        self.repository = repository
    }

    public func execute(restaurantId: Int) async throws -> [Category] {
        try await repository.getCategories(restaurantId: restaurantId)
    }
}
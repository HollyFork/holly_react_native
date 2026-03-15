//
//  GetCategoriesUseCase.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Combine

public final class GetCategoriesUseCase {
    private let repository: CategoryRepositoryProtocol
    public init(repository: CategoryRepositoryProtocol) { self.repository = repository }

    public func execute(restaurantId: Int?) -> AnyPublisher<[Category], AuthError> {
        repository.getCategories(restaurantId: restaurantId)
    }
}
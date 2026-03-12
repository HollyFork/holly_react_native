//
//  GetArticlesUseCase.swift
//  Core
//
//  Created by Hadj Rabah on 11/03/2026.
//


public protocol GetArticlesUseCase {
    func execute(restaurantId: Int) async throws -> [Article]
}

public class GetArticlesUseCaseImpl: GetArticlesUseCase {

    private let repository: MenuRepository

    public init(repository: MenuRepository) {
        self.repository = repository
    }

    public func execute(restaurantId: Int) async throws -> [Article] {
        try await repository.getArticles(restaurantId: restaurantId)
    }
}
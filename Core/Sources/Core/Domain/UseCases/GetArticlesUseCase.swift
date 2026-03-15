//
//  GetArticlesUseCase.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Combine

public final class GetArticlesUseCase {
    private let repository: ArticleRepositoryProtocol
    public init(repository: ArticleRepositoryProtocol) { self.repository = repository }

    public func execute(disponible: Bool? = true) -> AnyPublisher<[Article], AuthError> {
        repository.getArticles(disponible: disponible)
    }
}
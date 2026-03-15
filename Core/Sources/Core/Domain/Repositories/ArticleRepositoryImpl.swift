//
//  ArticleRepositoryImpl.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Combine
import Foundation

final class ArticleRepositoryImpl: ArticleRepositoryProtocol {
    private let dataSource: HomeDataSource
    init(dataSource: HomeDataSource) { self.dataSource = dataSource }

    func getArticles(disponible: Bool?) -> AnyPublisher<[Article], AuthError> {
        dataSource.getArticles(disponible: disponible)
            .map { $0.results.map { $0.toDomain() } }
            .eraseToAnyPublisher()
    }
}

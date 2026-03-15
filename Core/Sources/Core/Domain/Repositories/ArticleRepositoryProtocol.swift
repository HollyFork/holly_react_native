//
//  ArticleRepositoryProtocol.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Combine

public protocol ArticleRepositoryProtocol {
    func getArticles(disponible: Bool?) -> AnyPublisher<[Article], AuthError>
}
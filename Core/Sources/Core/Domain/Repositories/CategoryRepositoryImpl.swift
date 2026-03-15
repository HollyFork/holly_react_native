//
//  CategoryRepositoryImpl.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//

import Foundation
import Combine

final class CategoryRepositoryImpl: CategoryRepositoryProtocol {
    private let dataSource: HomeDataSource
    init(dataSource: HomeDataSource) { self.dataSource = dataSource }

    func getCategories(restaurantId: Int?) -> AnyPublisher<[Category], AuthError> {
        dataSource.getCategories(restaurantId: restaurantId)
            .map { $0.results.map { $0.toDomain() } }  // ← CategoryItemDTO.toDomain()
            .eraseToAnyPublisher()
    }
}

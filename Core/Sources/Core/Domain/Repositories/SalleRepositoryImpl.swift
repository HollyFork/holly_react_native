//
//  SalleRepositoryImpl.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//

import Foundation
import Combine

final class SalleRepositoryImpl: SalleRepositoryProtocol {
    private let dataSource: HomeDataSource
    init(dataSource: HomeDataSource) { self.dataSource = dataSource }

    func getSalles(restaurantId: Int?) -> AnyPublisher<[Salle], AuthError> {
        dataSource.getSalles(restaurantId: restaurantId)
            .map { $0.results.map { $0.toDomain() } }
            .eraseToAnyPublisher()
    }
}

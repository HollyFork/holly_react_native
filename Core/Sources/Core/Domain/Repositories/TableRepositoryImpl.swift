//
//  TableRepositoryImpl.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//
import Foundation
import Combine


final class TableRepositoryImpl: TableRepositoryProtocol {
    private let dataSource: HomeDataSource
    init(dataSource: HomeDataSource) { self.dataSource = dataSource }

    func getTables(salleId: Int?) -> AnyPublisher<[Table], AuthError> {
        dataSource.getTables(salleId: salleId)
            .map { $0.results.map { $0.toDomain() } }
            .eraseToAnyPublisher()
    }
}

//
//  GetTablesUseCase.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Combine

public final class GetTablesUseCase {
    private let repository: TableRepositoryProtocol
    public init(repository: TableRepositoryProtocol) { self.repository = repository }

    public func execute(salleId: Int?) -> AnyPublisher<[Table], AuthError> {
        repository.getTables(salleId: salleId)
    }
}
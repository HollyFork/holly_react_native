//
//  TableRepositoryProtocol.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Combine

public protocol TableRepositoryProtocol {
    func getTables(salleId: Int?) -> AnyPublisher<[Table], AuthError>
}
//
//  SalleRepositoryProtocol.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Combine

public protocol SalleRepositoryProtocol {
    func getSalles(restaurantId: Int?) -> AnyPublisher<[Salle], AuthError>
}
//
//  CommandeRepositoryProtocol.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Combine

public protocol CommandeRepositoryProtocol {
    func getCommandes(restaurantId: Int?, statut: String?) -> AnyPublisher<[Commande], AuthError>
}
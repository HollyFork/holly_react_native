//
//  GetCommandesUseCase.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Combine

public final class GetCommandesUseCase {
    private let repository: CommandeRepositoryProtocol
    public init(repository: CommandeRepositoryProtocol) { self.repository = repository }

    public func execute(restaurantId: Int?, statut: String? = "EN_COURS") -> AnyPublisher<[Commande], AuthError> {
        repository.getCommandes(restaurantId: restaurantId, statut: statut)
    }
}
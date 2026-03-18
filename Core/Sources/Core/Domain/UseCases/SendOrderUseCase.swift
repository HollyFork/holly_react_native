//
//  SendOrderUseCase.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Foundation

public final class SendOrderUseCase {

    private let createOrderUseCase:  CreateOrderUseCase
    private let addOrderLineUseCase: AddOrderLineUseCase

    public init(
        createOrderUseCase:  CreateOrderUseCase,
        addOrderLineUseCase: AddOrderLineUseCase
    ) {
        self.createOrderUseCase  = createOrderUseCase
        self.addOrderLineUseCase = addOrderLineUseCase
    }

    /// Crée la commande si besoin, puis envoie toutes les lignes
    public func execute(
        existingCommandeId: Int?,
        tableId:            Int,
        restaurantId:       Int,
        createdById:        Int,
        items:              [OrderItem]
    ) async throws -> Int {  // retourne le commandeId final
        // 1️⃣ Créer la commande si elle n'existe pas
        let commandeId: Int
        if let existing = existingCommandeId {
            commandeId = existing
        } else {
            let order = try await createOrderUseCase.execute(
                tableId:      tableId,
                restaurantId: restaurantId,
                createdById:  createdById
            )
            commandeId = order.id
            print("✅ Commande créée — id: \(commandeId)")
        }

        // 2️⃣ Envoyer chaque ligne
        for item in items {
            _ = try await addOrderLineUseCase.execute(
                commandeId: commandeId,
                articleId:  item.article.id,
                quantity:   item.quantity
            )
            print("✅ Ligne envoyée — article: \(item.article.name) × \(item.quantity)")
        }

        return commandeId
    }
}
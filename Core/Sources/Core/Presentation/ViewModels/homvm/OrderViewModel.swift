//
//  OrderViewModel.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Foundation

@MainActor
public final class OrderViewModel: ObservableObject {

    @Published public var uiState:    OrderUiState = .idle
    @Published public var commandeId: Int?         = nil

    private let sendOrderUseCase: SendOrderUseCase

    public init(sendOrderUseCase: SendOrderUseCase) {
        self.sendOrderUseCase = sendOrderUseCase
    }

    // MARK: - Send
    public func sendOrder(
        tableId:      Int,
        restaurantId: Int,
        items:        [OrderItem]
    ) async {
        guard !items.isEmpty else {
            uiState = .error("Aucun article à envoyer")
            return
        }

        uiState = .loading

        let createdById = SessionManager.shared.employeeId ?? 0

        do {
            uiState = .sendingLines(current: 0, total: items.count)

            let finalCommandeId = try await sendOrderUseCase.execute(
                existingCommandeId: commandeId,
                tableId:            tableId,
                restaurantId:       restaurantId,
                createdById:        createdById,
                items:              items
            )

            commandeId = finalCommandeId
            uiState    = .success(commandeId: finalCommandeId)
            print("✅ Commande complète — id: \(finalCommandeId), \(items.count) lignes")

        } catch let error as AuthError {
            uiState = .error(error.errorDescription ?? "Erreur inconnue")
        } catch {
            uiState = .error(error.localizedDescription)
        }
    }

    public func reset() {
        uiState    = .idle
        commandeId = nil
    }
}
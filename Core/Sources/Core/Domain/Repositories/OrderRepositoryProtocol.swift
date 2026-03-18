//
//  OrderRepositoryProtocol.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Foundation

public protocol OrderRepositoryProtocol {
    func createOrder(
        tableId:      Int,
        restaurantId: Int,
        createdById:  Int
    ) async throws -> Order

    func addOrderLine(
        commandeId:      Int,
        articleId:       Int,
        quantity:        Int,
        awaitingService: Bool
    ) async throws -> OrderLine
}
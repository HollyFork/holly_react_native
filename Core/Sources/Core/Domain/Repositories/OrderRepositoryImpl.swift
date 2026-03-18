//
//  OrderRepositoryImpl.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Foundation

final class OrderRepositoryImpl: OrderRepositoryProtocol {

    private let dataSource: OrderRemoteDataSource

    init(dataSource: OrderRemoteDataSource) {
        self.dataSource = dataSource
    }

    func createOrder(tableId: Int, restaurantId: Int, createdById: Int) async throws -> Order {
        let dto = CreateOrderRequestDTO(
            createdById:   createdById,
            restaurantId:  restaurantId,
            tableId:       tableId,
            status:        "EN_COURS",
            priority:      "NORMAL",
            kitchenStatus: "PENDING"
        )
        return try await dataSource.createOrder(dto).toDomain()
    }

    func addOrderLine(
        commandeId:      Int,
        articleId:       Int,
        quantity:        Int,
        awaitingService: Bool
    ) async throws -> OrderLine {
        let dto = AddOrderLineRequestDTO(
            commandeId:      commandeId,
            quantity:        quantity,
            articleId:       articleId,
            awaitingService: awaitingService
        )
        return try await dataSource.addOrderLine(dto).toDomain()
    }
}
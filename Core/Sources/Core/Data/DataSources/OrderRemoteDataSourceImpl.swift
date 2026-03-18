//
//  OrderRemoteDataSourceImpl.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Foundation

final class OrderRemoteDataSourceImpl: OrderRemoteDataSource {

    private let networkClient: NetworkClient

    init(networkClient: NetworkClient) {
        self.networkClient = networkClient
    }

    func createOrder(_ dto: CreateOrderRequestDTO) async throws -> OrderResponseDTO {
        try await networkClient.postAsync(endpoint: .createCommande, body: dto)
    }

    func addOrderLine(_ dto: AddOrderLineRequestDTO) async throws -> OrderLineResponseDTO {
        try await networkClient.postAsync(endpoint: .addLigneCommande, body: dto)
    }
}
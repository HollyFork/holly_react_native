//
//  OrderRemoteDataSource.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Foundation

protocol OrderRemoteDataSource {
    func createOrder(_ dto: CreateOrderRequestDTO)       async throws -> OrderResponseDTO
    func addOrderLine(_ dto: AddOrderLineRequestDTO)     async throws -> OrderLineResponseDTO
}
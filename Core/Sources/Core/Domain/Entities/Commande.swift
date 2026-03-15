//
//  Commande.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


public struct Commande: Identifiable, Equatable {
    public let id:           Int
    public let itemsCount:   Int
    public let amount:       String
    public let status:       String
    public let kitchenStatus: String
    public let priority:     String
    public let tableId:      Int?
    public let tableNumero:  Int?
    public let restaurantId: Int
    public let isInProgress: Bool
    public let createdAt:    String
}
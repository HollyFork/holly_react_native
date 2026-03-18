//
//  OrderLine.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Foundation

public struct OrderLine: Equatable {
    public let id:              Int?
    public let commandeId:      Int?
    public let articleId:       Int
    public let articleName:     String
    public let articlePrice:    String
    public let quantity:        Int
    public let unitPrice:       String
    public let awaitingService: Bool
    public let costOfGoodsSold: String

    public init(
        id:              Int?   = nil,
        commandeId:      Int?   = nil,
        articleId:       Int,
        articleName:     String,
        articlePrice:    String = "",
        quantity:        Int,
        unitPrice:       String = "",
        awaitingService: Bool   = false,
        costOfGoodsSold: String = ""
    ) {
        self.id              = id
        self.commandeId      = commandeId
        self.articleId       = articleId
        self.articleName     = articleName
        self.articlePrice    = articlePrice
        self.quantity        = quantity
        self.unitPrice       = unitPrice
        self.awaitingService = awaitingService
        self.costOfGoodsSold = costOfGoodsSold
    }

    // Prix total affiché
    public var totalPrice: Double {
        let cleaned = unitPrice
            .replacingOccurrences(of: ",", with: ".")
            .trimmingCharacters(in: CharacterSet(charactersIn: "."))
        return (Double(cleaned) ?? 0) * Double(quantity)
    }

    public var formattedTotalPrice: String {
        String(format: "%.2f€", totalPrice)
    }
}
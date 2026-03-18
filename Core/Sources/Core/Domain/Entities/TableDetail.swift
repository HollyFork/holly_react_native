//
//  TableDetail.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


public struct TableDetail: Equatable {
    public let id:                  Int
    public let numero:              Int
    public let capacity:            Int
    public let isOccupied:          Bool
    public let salleId:             Int
    public let salleName:           String
    public let existingCommandeId:  Int?       // ← commande EN_COURS si existe
    public let existingOrderItems:  [OrderLine] // ← lignes de la commande existante

    public init(
        id:                 Int,
        numero:             Int,
        capacity:           Int,
        isOccupied:         Bool,
        salleId:            Int,
        salleName:          String,
        existingCommandeId: Int?        = nil,
        existingOrderItems: [OrderLine] = []
    ) {
        self.id                 = id
        self.numero             = numero
        self.capacity           = capacity
        self.isOccupied         = isOccupied
        self.salleId            = salleId
        self.salleName          = salleName
        self.existingCommandeId = existingCommandeId
        self.existingOrderItems = existingOrderItems
    }
}

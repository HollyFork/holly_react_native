//
//  Table.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


public struct Table: Identifiable, Equatable {
    public let id:              Int
    public let numero:          Int
    public let capacity:        Int
    public let reservedSeats:   Int
    public let isOccupied:      Bool
    public let salleId:         Int
    public let salleName:       String
    public let positionX:       Int
    public let positionY:       Int
}
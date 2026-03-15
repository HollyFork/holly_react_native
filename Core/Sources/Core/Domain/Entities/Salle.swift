//
//  Salle.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


public struct Salle: Identifiable, Equatable {
    public let id:           Int
    public let name:         String
    public let restaurantId: Int
    public let capacity:     Int
    public let floor:        Int
    public let description:  String?
}
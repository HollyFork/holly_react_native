//
//  Category.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


public struct Category: Identifiable, Equatable {
    public let id:           Int
    public let name:         String
    public let displayOrder: Int
    public let description:  String?
}
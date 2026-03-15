//
//  Reservation.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Foundation

public struct Reservation: Identifiable, Equatable {
    public let id:          Int
    public let clientName:  String
    public let partySize:   Int
    public let datetime:    Date
    public let phoneNumber: String?
    public let salleId:     Int
    public let salleName:   String
    public let tableId:     Int?
    public let tableNumero: Int?
}
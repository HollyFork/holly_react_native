//
//  DeviceSession.swift
//  Core
//
//  Created by Hadj Rabah on 14/03/2026.
//


public struct DeviceSession: Equatable {
    public let deviceToken: String
    public let restaurantId: Int
    public let restaurantName: String
    public let restaurantVille: String

    public init(
        deviceToken: String,
        restaurantId: Int,
        restaurantName: String,
        restaurantVille: String
    ) {
        self.deviceToken    = deviceToken
        self.restaurantId   = restaurantId
        self.restaurantName = restaurantName
        self.restaurantVille = restaurantVille
    }
}
//
//  AuthRepositoryProtocol.swift
//  Core
//
//  Created by Hadj Rabah on 14/03/2026.
//


import Combine

public protocol AuthRepositoryProtocol {
    func deviceLogin(restaurantId: Int, pinRestaurant: String) -> AnyPublisher<DeviceSession, AuthError>
    func quickLogin(pinCode: String)                           -> AnyPublisher<Session, AuthError>
}
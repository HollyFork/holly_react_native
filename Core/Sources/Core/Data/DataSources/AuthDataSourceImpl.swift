//
//  AuthDataSourceImpl.swift
//  Core
//
//  Created by Hadj Rabah on 14/03/2026.
//


import Combine

final class AuthDataSourceImpl: AuthDataSource {

    private let networkClient: NetworkClient

    init(networkClient: NetworkClient) {
        self.networkClient = networkClient
    }

    func deviceLogin(request: DeviceLoginRequestDTO) -> AnyPublisher<DeviceLoginResponseDTO, AuthError> {
        networkClient.post(endpoint: .deviceLogin, body: request)
    }

    func quickLogin(request: QuickLoginRequestDTO) -> AnyPublisher<QuickLoginResponseDTO, AuthError> {
        networkClient.post(endpoint: .quickLogin, body: request)
    }
}
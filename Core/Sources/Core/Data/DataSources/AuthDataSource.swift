//
//  AuthDataSource.swift
//  Core
//
//  Created by Hadj Rabah on 14/03/2026.
//


import Combine

protocol AuthDataSource {
    func deviceLogin(request: DeviceLoginRequestDTO) -> AnyPublisher<DeviceLoginResponseDTO, AuthError>
    func quickLogin(request: QuickLoginRequestDTO)   -> AnyPublisher<QuickLoginResponseDTO, AuthError>
}
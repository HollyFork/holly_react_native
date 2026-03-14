//
//  PlanningDataSourceImpl.swift
//  Core
//
//  Created by Hadj Rabah on 14/03/2026.
//
import Combine

final class PlanningDataSourceImpl: PlanningDataSource {

    private let networkClient: NetworkClient

    init(networkClient: NetworkClient) {
        self.networkClient = networkClient
    }

    func getEmploiDuTemps(filter: PlanningFilter) -> AnyPublisher<EmploiDuTempsResponseDTO, AuthError> {
        networkClient.getWithParams(
            endpoint: .emploiDuTemps,
            queryItems: filter.queryItems
        )
    }
}

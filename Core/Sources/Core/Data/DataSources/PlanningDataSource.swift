//
//  PlanningDataSource.swift
//  Core
//
//  Created by Hadj Rabah on 14/03/2026.
//


import Combine

protocol PlanningDataSource {
    func getEmploiDuTemps(filter: PlanningFilter) -> AnyPublisher<EmploiDuTempsResponseDTO, AuthError>
}

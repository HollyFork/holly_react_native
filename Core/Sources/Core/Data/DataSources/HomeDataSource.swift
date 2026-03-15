//
//  HomeDataSource.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Combine
import Foundation

protocol HomeDataSource {
    func getArticles(disponible: Bool?)                          -> AnyPublisher<ArticleListDTO, AuthError>
    func getCategories(restaurantId: Int?)                       -> AnyPublisher<CategoryListDTO, AuthError>  // ← CategoryListDTO
    func getSalles(restaurantId: Int?)                           -> AnyPublisher<SalleListDTO, AuthError>
    func getTables(salleId: Int?)                                -> AnyPublisher<TableListDTO, AuthError>
    func getCommandes(restaurantId: Int?, statut: String?)       -> AnyPublisher<CommandeListDTO, AuthError>
    func getReservations(restaurantId: Int?, date: String?)  -> AnyPublisher<ReservationListDTO, AuthError>
    func getReservation(id: Int)                             -> AnyPublisher<ReservationDTO, AuthError>
    func createReservation(_ dto: ReservationRequestDTO)     -> AnyPublisher<ReservationDTO, AuthError>
    func updateReservation(id: Int, _ dto: ReservationRequestDTO) -> AnyPublisher<ReservationDTO, AuthError>
    func deleteReservation(id: Int)                          -> AnyPublisher<Void, AuthError>
}

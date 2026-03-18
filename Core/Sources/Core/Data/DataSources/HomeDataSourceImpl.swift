//
//  HomeDataSourceImpl.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//

import Combine
import Foundation

final class HomeDataSourceImpl: HomeDataSource {

    private let networkClient: NetworkClient

    init(networkClient: NetworkClient) {
        self.networkClient = networkClient
    }

    func getArticles(disponible: Bool?) -> AnyPublisher<ArticleListDTO, AuthError> {
        var items: [URLQueryItem] = []
        if let d = disponible { items.append(URLQueryItem(name: "disponible", value: d ? "true" : "false")) }
        return networkClient.getWithParams(endpoint: .articles, queryItems: items)
    }

    func getCategories(restaurantId: Int?) -> AnyPublisher<CategoryListDTO, AuthError> {
        var items: [URLQueryItem] = []
        if let id = restaurantId {
            items.append(URLQueryItem(name: "restaurant_id", value: String(id)))
        }
        return networkClient.getWithParams(endpoint: .categories, queryItems: items)
    }

    func getSalles(restaurantId: Int?) -> AnyPublisher<SalleListDTO, AuthError> {
        var items: [URLQueryItem] = []
        if let id = restaurantId {
            items.append(URLQueryItem(name: "restaurant_id", value: String(id)))
        }
        return networkClient.getWithParams(endpoint: .salles, queryItems: items)
    }

    func getTables(salleId: Int?) -> AnyPublisher<TableListDTO, AuthError> {
        var items: [URLQueryItem] = []
        if let id = salleId { items.append(URLQueryItem(name: "salle_id", value: String(id))) }
        return networkClient.getWithParams(endpoint: .tables, queryItems: items)
    }

    func getCommandes(restaurantId: Int?, statut: String?) -> AnyPublisher<CommandeListDTO, AuthError> {
        var items: [URLQueryItem] = []
        if let id = restaurantId { items.append(URLQueryItem(name: "restaurant_id", value: String(id))) }
        if let s  = statut       { items.append(URLQueryItem(name: "statut", value: s)) }
        return networkClient.getWithParams(endpoint: .commandes, queryItems: items)
    }

    func getReservations(restaurantId: Int?, date: String?) -> AnyPublisher<ReservationListDTO, AuthError> {
        var items: [URLQueryItem] = []
        if let id = restaurantId { items.append(URLQueryItem(name: "restaurant_id", value: String(id))) }
        if let d  = date         { items.append(URLQueryItem(name: "date", value: d)) }
        return networkClient.getWithParams(endpoint: .reservations, queryItems: items)
    }

    func getReservation(id: Int) -> AnyPublisher<ReservationDTO, AuthError> {
        networkClient.get(endpoint: .reservationDetail(id: id))
    }

    func createReservation(_ dto: ReservationRequestDTO) -> AnyPublisher<ReservationDTO, AuthError> {
        networkClient.post(endpoint: .reservations, body: dto)
    }

    func updateReservation(id: Int, _ dto: ReservationRequestDTO) -> AnyPublisher<ReservationDTO, AuthError> {
        networkClient.put(endpoint: .reservationDetail(id: id), body: dto)
    }

    func deleteReservation(id: Int) -> AnyPublisher<Void, AuthError> {
        networkClient.delete(endpoint: .reservationDetail(id: id))
    }
}

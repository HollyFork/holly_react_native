//
//  ReservationRemoteDataSource 2.swift
//  Core
//
//  Created by Hadj Rabah on 05/03/2026.
//


// Data/DataSources/ReservationRemoteDataSource.swift
import Foundation

public protocol ReservationRemoteDataSource {
    func fetchReservations(
        restaurantId: Int?,
        date: Date?,
        roomId: Int?
    ) async throws -> [Reservation]

    func updateReservation(
        id: Int,
        body: ReservationUpdateRequest
    ) async throws -> Reservation
}

public class ReservationRemoteDataSourceImpl: ReservationRemoteDataSource {

    public init() {}

    // MARK: - GET /reservations/
    public func fetchReservations(
        restaurantId: Int? = nil,
        date: Date? = nil,
        roomId: Int? = nil
    ) async throws -> [Reservation] {

        guard var urlComponents = URLComponents(url: APIEndpoint.reservations.url!, resolvingAgainstBaseURL: false) else {
            fatalError("URL invalide")
        }

        var queryItems: [URLQueryItem] = []
        if let restaurantId { queryItems.append(URLQueryItem(name: "restaurant_id", value: "\(restaurantId)")) }
        if let date {
            let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd"
            queryItems.append(URLQueryItem(name: "date", value: f.string(from: date)))
        }
        if let roomId { queryItems.append(URLQueryItem(name: "salle_id", value: "\(roomId)")) }
        urlComponents.queryItems = queryItems.isEmpty ? nil : queryItems

        guard let url = urlComponents.url else { fatalError("URL finale invalide") }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        applyAuthToken(to: &request)

        print("📤 GET Reservations: \(url.absoluteString)")
        let (data, response) = try await URLSession.shared.data(for: request)
        try validateResponse(response, data: data)

        struct ReservationListResponse: Codable {
            let count: Int
            let next: String?
            let previous: String?
            let results: [ReservationDTO]
        }

        let decoder = JSONDecoder()
        let decoded = try decoder.decode(ReservationListResponse.self, from: data)
        print("✅ Reservations décodées: \(decoded.results.count)")
        return decoded.results.map { $0.toDomain() }
    }

    // MARK: - PUT /reservations/{id}/
    public func updateReservation(
        id: Int,
        body: ReservationUpdateRequest
    ) async throws -> Reservation {

        let baseURL = "http://localhost:8000/api/reservations/\(id)/"
        guard let url = URL(string: baseURL) else { fatalError("URL invalide pour update") }

        let iso = ISO8601DateFormatter()
        let putBody = UpdateReservationBody(
            nom_client: body.clientName,
            nombre_personnes: body.numberOfPeople,
            date_heure: iso.string(from: body.dateTime),
            telephone: body.phone,
            auteur: body.author,
            note_client: body.clientNote,
            note_reservation: body.reservationNote,
            allergies: body.allergies,
            duree_repas: body.mealDuration
        )

        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        applyAuthToken(to: &request)
        request.httpBody = try JSONEncoder().encode(putBody)

        print("📤 PUT Reservation id=\(id): \(url.absoluteString)")
        let (data, response) = try await URLSession.shared.data(for: request)
        try validateResponse(response, data: data)

        let dto = try JSONDecoder().decode(ReservationDTO.self, from: data)
        print("✅ Réservation mise à jour: id=\(dto.id)")
        return dto.toDomain()
    }

    // MARK: - Helpers
    private func applyAuthToken(to request: inout URLRequest) {
        if let token = SessionCache.shared.accessToken ?? KeychainManager.shared.getToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        } else {
            print("⚠️ Aucun token trouvé")
        }
    }

    private func validateResponse(_ response: URLResponse, data: Data) throws {
        guard let http = response as? HTTPURLResponse else { return }
        print("📥 Status: \(http.statusCode)")
        if !(200...299).contains(http.statusCode) {
            let text = String(data: data, encoding: .utf8) ?? ""
            throw NSError(domain: "ReservationError", code: http.statusCode,
                          userInfo: [NSLocalizedDescriptionKey: text])
        }
    }
}
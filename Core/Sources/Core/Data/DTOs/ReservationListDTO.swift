import Foundation

struct ReservationListDTO: Decodable {
    let count:    Int
    let next:     String?
    let previous: String?
    let results:  [ReservationDTO]
}

struct ReservationDTO: Decodable {
    let id:          Int
    let clientName:  String
    let partySize:   Int
    let datetime:    String
    let phoneNumber: String?
    let salleId:     Int
    let tableId:     Int?

    enum CodingKeys: String, CodingKey {
        case id, datetime
        case clientName  = "client_name"
        case partySize   = "party_size"
        case phoneNumber = "phone_number"
        case salleId     = "salle_id"
        case tableId     = "table_id"
    }

    private static let formatters: [ISO8601DateFormatter] = {
        let withMs = ISO8601DateFormatter()
        withMs.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let withoutMs = ISO8601DateFormatter()
        withoutMs.formatOptions = [.withInternetDateTime]
        return [withMs, withoutMs]
    }()

    func toDomain() -> Reservation? {
        let date = Self.formatters.lazy.compactMap { $0.date(from: datetime) }.first
        guard let date else { return nil }

        return Reservation(
            id:          id,
            clientName:  clientName,
            partySize:   partySize,
            datetime:    date,
            phoneNumber: phoneNumber,
            salleId:     salleId,
            tableId:     tableId
        )
    }
}

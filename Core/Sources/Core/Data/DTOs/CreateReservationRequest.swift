 

import Foundation

public struct CreateReservationRequest {
    public let clientName:   String
    public let partySize:    Int
    public let datetime:     Date
    public let phoneNumber:  String?
    public let salleId:      Int
    public let tableId:      Int?

    public init(
        clientName:  String,
        partySize:   Int,
        datetime:    Date,
        phoneNumber: String? = nil,
        salleId:     Int,
        tableId:     Int?    = nil
    ) {
        self.clientName  = clientName
        self.partySize   = partySize
        self.datetime    = datetime
        self.phoneNumber = phoneNumber
        self.salleId     = salleId
        self.tableId     = tableId
    }
}

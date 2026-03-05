import Foundation

// Assure-toi que Reservation est Equatable
public struct Reservation: Equatable, Identifiable {
    public let id: Int
    public let clientName: String
    public let numberOfPeople: Int
    public let dateTime: Date
    public let phone: String
    public let roomName: String
    
    public init(id: Int, clientName: String, numberOfPeople: Int, dateTime: Date, phone: String, roomName: String) {
        self.id = id
        self.clientName = clientName
        self.numberOfPeople = numberOfPeople
        self.dateTime = dateTime
        self.phone = phone
        self.roomName = roomName
    }
}

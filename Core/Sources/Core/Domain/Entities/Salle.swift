

import Foundation

public struct Salle: Identifiable, Equatable {
    public let id: Int
    public let name: String
    public let description: String?
    public let capacity: Int
    public let floor: Int?
    public let restaurantId: Int
}

import Foundation


public struct DeviceLoginRequest: Codable {
    public let restaurant_id: Int
    public let pin_restaurant: String
    
    public init(restaurant_id: Int, pin_restaurant: String) {
        self.restaurant_id = restaurant_id
        self.pin_restaurant = pin_restaurant
    }
}


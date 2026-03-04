import Foundation


public struct DeviceLoginResponse: Codable {
    public let message: String
    public let device_token: String
    public let restaurant_id: Int
    public let restaurant_name: String
    public let next_step: String
}

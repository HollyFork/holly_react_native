import Foundation
public struct EmployeeLoginRequest: Codable {
    public let pin_code: String
    public let device_token: String
    
    public init(pin: String, deviceToken: String) {
        self.pin_code = pin
        self.device_token = deviceToken
    }
}

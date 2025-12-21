import Foundation

public struct EmployeeLoginRequest: Codable {
    public let pin_code: String
    
    public init(pin: String) {
        self.pin_code = pin
    }
}

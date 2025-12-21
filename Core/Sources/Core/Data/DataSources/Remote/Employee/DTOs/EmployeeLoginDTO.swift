import Foundation

public struct EmployeeLoginDTO: Codable {
    public let id_user: Int
    public let username: String
    public let email: String
    public let first_name: String
    public let last_name: String
    public let role: String
    public let access_token: String
    public let refresh_token: String
}

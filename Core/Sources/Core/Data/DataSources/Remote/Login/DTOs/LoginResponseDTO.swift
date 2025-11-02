import Foundation

public struct LoginResponseDTO: Codable {
    public let idUser: Int
    public let username: String
    public let email: String
    public let firstName: String
    public let lastName: String
    public let accessToken: String
    public let refreshToken: String
    
    public enum CodingKeys: String, CodingKey {
        case idUser = "id_user"
        case username
        case email
        case firstName = "first_name"
        case lastName = "last_name"
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
    }
    
    public init(idUser: Int, username: String, email: String, firstName: String, lastName: String, accessToken: String, refreshToken: String) {
        self.idUser = idUser
        self.username = username
        self.email = email
        self.firstName = firstName
        self.lastName = lastName
        self.accessToken = accessToken
        self.refreshToken = refreshToken
    }
}

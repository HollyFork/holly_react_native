import Foundation

public struct UserSession {
    public let token: String
    public let userId: Int
    public let refreshToken: String
    
    public init(token: String, userId: Int, refreshToken : String) {
        self.token = token
        self.userId = userId
        self.refreshToken = refreshToken
    }
}

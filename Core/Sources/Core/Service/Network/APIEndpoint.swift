import Foundation

public enum APIEndpoint {
    case deviceLogin
    case quickLogin
    case refreshToken
    case logout
    case emploiDuTemps 

    private static let baseURL = "https://hollyfork.org" 

    public var path: String {
        switch self {
        case .deviceLogin:              return "/api/auth/device-login/"
        case .quickLogin:               return "/api/auth/quick-login/"
        case .refreshToken:             return "/api/auth/token/refresh/"
        case .logout:                   return "/api/auth/logout/"
        case .emploiDuTemps:            return "/api/planning/shifts/emploi-du-temps/"
        }
    }

    public var url: URL? {
        URL(string: APIEndpoint.baseURL + path)
    }
}

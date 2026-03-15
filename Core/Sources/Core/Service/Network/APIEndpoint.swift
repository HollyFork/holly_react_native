import Foundation

public enum APIEndpoint {
    // Auth
    case deviceLogin
    case quickLogin
    case refreshToken
    case logout
    // Planning
    case emploiDuTemps
    // Home
    case articles
    case categories
    case salles
    case tables
    case commandes
    case reservations
    case reservationDetail(id: Int)

    private static let baseURL = "https://hollyfork.org" 

    public var path: String {
        switch self {
        case .deviceLogin:              return "/api/auth/device-login/"
        case .quickLogin:               return "/api/auth/quick-login/"
        case .refreshToken:             return "/api/auth/token/refresh/"
        case .logout:                   return "/api/auth/logout/"
        case .emploiDuTemps:            return "/api/planning/shifts/emploi-du-temps/"
        case .articles:                 return "/api/articles/"
        case .categories:               return "/api/categories/"
        case .salles:                   return "/api/salles/"
        case .tables:                   return "/api/tables/"
        case .commandes:                return "/api/commandes/"
        case .reservations:             return "/api/reservations/"
        case .reservationDetail(let id): return "/api/reservations/\(id)/"

        }
    }

    public var url: URL? {
        URL(string: APIEndpoint.baseURL + path)
    }
}

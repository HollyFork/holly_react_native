import Foundation

public enum APIEndpoint {
    case deviceLogin
    case quickLogin
    case refreshToken
    case logout
    case emploiDuTemps
    case articles
    case categories
    case salles
    case tables
    case createTable
    case commandesByTable(tableId: Int)
    case commandes
    case reservations
    case reservationDetail(id: Int)
    case createCommande
    case commandeDetail(id: Int)
    case tableDetail(id: Int)
    case addLigneCommande
    case updateLigneCommande(id: Int)
    case deleteLigneCommande(id: Int)
    case kitchenPrint(id: Int)

    private static let baseURL = "https://hollyfork.org" 

    public var path: String {
        switch self {
        case .deviceLogin:                     return "/api/auth/device-login/"
        case .quickLogin:                      return "/api/auth/quick-login/"
        case .refreshToken:                    return "/api/auth/token/refresh/"
        case .logout:                          return "/api/auth/logout/"
        case .emploiDuTemps:                   return "/api/planning/shifts/emploi-du-temps/"
        case .articles:                        return "/api/articles/"
        case .categories:                      return "/api/categories/"
        case .salles:                          return "/api/salles/"
        case .tables:                          return "/api/tables/"
        case .commandes:                       return "/api/commandes/"
        case .reservations:                    return "/api/reservations/"
        case .reservationDetail(let id):       return "/api/reservations/\(id)/"
        case .createTable:                     return "/api/tables/"
        case .tableDetail(let id):             return "/api/tables/\(id)/"
        case .commandesByTable(let tableId):   return "/api/commandes/?table_id=\(tableId)&statut=EN_COURS"
        case .reservationDetail(let id):       return "/api/reservations/\(id)/"
        case .createCommande:                  return "/api/commandes/"
        case .commandeDetail(let id):          return "/api/commandes/\(id)/"
        case .addLigneCommande:                return "/api/lignes-commandes/"
        case .updateLigneCommande(let id):     return "/api/lignes-commandes/\(id)/"
        case .deleteLigneCommande(let id):     return "/api/lignes-commandes/\(id)/"
        case .createTable:                     return "/api/tables/"
        case .kitchenPrint(let id):            return "/api/commandes/\(id)/kitchen/print/"
            
    
        }
    }

    public var url: URL? {
        URL(string: APIEndpoint.baseURL + path)
    }
}

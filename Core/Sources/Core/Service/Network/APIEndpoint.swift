import Foundation

enum APIEndpoint: String {
    
    // Fait
    case deviceLogin = "auth/device-login"
    case verifyPin = "auth/verify-pin"
    
    case shifts = "planning/shifts"
    case planningStats = "planning/stats"
    
    
    // Pas encore implémenter en clean archi (UseCase,Repo, Data source)
    case logout = "auth/logout/"
    case quickLogin = "auth/quick-login" 
    case refresh = "auth/token/refresh/"
    case restaurants = "restaurants"
    case employees = "employes"
    case restaurantEmployees = "restaurant-employes"
    case employeeTypes = "type-employes"
    case ingredients = "ingredients"
    case stocks = "stocks"
    case articles = "articles"
    case articleIngredients = "article-ingredients"
    case orders = "commandes"
    case orderLines = "lignes-commandes"
    case restocks = "reapprovisionnements"
    case rooms = "salles"
    case tables = "tables"
    case reservations = "reservations"
    case reviews = "notes"
    case categories = "categories"
    
    private static let baseURLDebug = "http://localhost:8000/api/"
    private static let baseURLRelease = "https://hollyfork.org/api/"
    
    var url: URL? {
        let needsFormat = !(self == .deviceLogin || self == .quickLogin)
        let urlString = needsFormat
        ? "\(APIEndpoint.baseURLDebug)\(self.rawValue)/?format=api"
        : "\(APIEndpoint.baseURLDebug)\(self.rawValue)/"
        return URL(string: urlString)
    }
    
}

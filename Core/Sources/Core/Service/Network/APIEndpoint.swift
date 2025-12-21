import Foundation

enum APIEndpoint: String {
    
    case login = "auth/login"
    case verifyPin = "auth/verify-pin"
    case logout = "auth/logout/"
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
    
    private static let baseURLDebug = "http://127.0.0.1:8000/api/"
    private static let baseURLRelease = "https://hollyfork.org/api/"
    
    var url: URL? {
        let needsFormat = self != .login
        let urlString = needsFormat
        ? "\(APIEndpoint.baseURLRelease)\(self.rawValue)/?format=api"
        : "\(APIEndpoint.baseURLRelease)\(self.rawValue)/"
        return URL(string: urlString)
    }
    
}

 


import Foundation

public enum AuthError: Error, LocalizedError {
    case networkError(String)
    case serverError(String)
    case deviceNotConfigured
    case invalidResponse
    case decodingError
    case unknown

    public var errorDescription: String? {
        switch self {
        case .networkError(let msg):    return msg
        case .serverError(let msg):     return msg
        case .deviceNotConfigured:      return "Équipement non configuré. Veuillez reconnecter l'équipement."
        case .invalidResponse:          return "Réponse invalide du serveur."
        case .decodingError:            return "Erreur de décodage des données."
        case .unknown:                  return "Une erreur inconnue est survenue."
        }
    }
}

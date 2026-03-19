


public struct HomeData: Equatable {
    public let salles:       [Salle]
    public let tables:       [Table]
    public let commandes:    [Commande]
    public let reservations: [Reservation]
    public let articles:     [Article]
    public let categories:   [Category]
}

public enum HomeUiState: Equatable {
    case idle
    case loading
    case success(HomeData)
    case error(String)
}

 


public enum OrderUiState: Equatable {
    case idle
    case loading
    case orderCreated(Int)
    case sendingLines(current: Int, total: Int)
    case success(commandeId: Int)
    case error(String)

    public var isLoading: Bool {
        switch self {
        case .loading, .orderCreated, .sendingLines: return true
        default: return false
        }
    }
}

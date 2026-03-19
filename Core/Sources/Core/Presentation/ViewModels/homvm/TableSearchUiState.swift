 

public enum TableSearchUiState: Equatable {
    case idle
    case loading
    case found(TableDetail)
    case error(String)
}

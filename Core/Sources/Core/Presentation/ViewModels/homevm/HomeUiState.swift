import SwiftUI

enum HollyForkLoginUiState: Equatable {
    
    case idle
    case loading
    case success(message: String)
    case error(message: String)
    
    static func ==(lhs: HollyForkLoginUiState, rhs: HollyForkLoginUiState) -> Bool {
        switch (lhs, rhs) {
        case (.idle, .idle):
            return true
        case (.loading, .loading):
            return true
        case (.success(let msg1), .success(let msg2)):
            return msg1 == msg2
        case (.error(let msg1), .error(let msg2)):
            return msg1 == msg2
        default:
            return false
        }
    }
    
}

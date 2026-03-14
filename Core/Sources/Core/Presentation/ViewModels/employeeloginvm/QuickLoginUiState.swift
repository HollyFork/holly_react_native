import SwiftUI
import Foundation


enum EmployeeLoginUiState: Equatable {
    case idle
    case loading
    case success
    case error(message: String)
    
    static func ==(lhs: EmployeeLoginUiState, rhs: EmployeeLoginUiState) -> Bool {
        switch (lhs, rhs) {
        case (.idle, .idle), (.loading, .loading), (.success, .success): return true
        case (.error(let msg1), .error(let msg2)): return msg1 == msg2
        default: return false
        }
    }
}

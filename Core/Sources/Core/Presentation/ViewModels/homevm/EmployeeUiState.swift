import SwiftUI

enum EmployeeUiState: Equatable {
    
    case idle
    case loading
    case success(message: String)
    case error(message: String)
    
    static func ==(lhs: EmployeeUiState, rhs: EmployeeUiState) -> Bool {
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

public enum PlanningUiState: Equatable {
    case idle
    case loading
    case success(days: [DaySchedule], totalWeekHours: Double)
    case empty
    case error(String)

    public static func == (lhs: PlanningUiState, rhs: PlanningUiState) -> Bool {
        switch (lhs, rhs) {
        case (.idle, .idle), (.loading, .loading), (.empty, .empty): return true
        case (.error(let a), .error(let b)):                          return a == b
        case (.success(let d1, let h1), .success(let d2, let h2)):   return d1.map(\.id) == d2.map(\.id) && h1 == h2
        default:                                                       return false
        }
    }
}

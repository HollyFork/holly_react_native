import SwiftUI

enum EmployeeLoginUiState: Equatable {
    case idle
    case loading
    case success(message: String)
    case error(message: String)
}

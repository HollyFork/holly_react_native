import SwiftUI

import Foundation
import Combine

public enum UiState: Equatable {
    case idle
    case loading
    case success
    case error(String)

    public var hasError: Bool {
        if case .error = self { return true }
        return false
    }

    public var isLoading: Bool {
        self == .loading
    }
}

import SwiftUI
import Foundation
import Combine

extension AuthError {
    var isUnauthorized: Bool {
        if case .serverError(let msg) = self {
            return msg.hasPrefix("401|")
        }
        return false
    }

    // Message propre sans le préfixe technique
    var displayMessage: String? {
        if case .serverError(let msg) = self {
            return msg.hasPrefix("401|")
                ? msg.replacingOccurrences(of: "401|", with: "")
                : msg
        }
        return errorDescription
    }
}

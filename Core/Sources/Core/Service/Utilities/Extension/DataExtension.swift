import SwiftUI

extension Data: Identifiable {
    public var id: UUID {
        UUID()
    }
}

import Foundation

extension Data: Identifiable {
    public var id: UUID {
        UUID()
    }
}

import Foundation

public final class SessionManager {

    public static let shared = SessionManager()
    private init() {}

    private let defaults = UserDefaults.standard

    // MARK: - Keys — CaseIterable directement ici
    private enum Key: String, CaseIterable {
        case employeeId     = "session.employeeId"
        case employeeName   = "session.employeeName"
        case employeeType   = "session.employeeType"
        case restaurantId   = "session.restaurantId"
        case restaurantName = "session.restaurantName"
    }

    // MARK: - Save
    public func saveSession(_ session: Session) {
        defaults.set(session.employeeId,     forKey: Key.employeeId.rawValue)
        defaults.set(session.employeeName,   forKey: Key.employeeName.rawValue)
        defaults.set(session.employeeType,   forKey: Key.employeeType.rawValue)
        defaults.set(session.restaurantId,   forKey: Key.restaurantId.rawValue)
        defaults.set(session.restaurantName, forKey: Key.restaurantName.rawValue)

        print("✅ Session saved — employeeId: \(session.employeeId), restaurantId: \(session.restaurantId)")
    }

    // MARK: - Read
    public var employeeId:    Int?    { defaults.object(forKey: Key.employeeId.rawValue)    as? Int }
    public var employeeName:  String? { defaults.string(forKey: Key.employeeName.rawValue)  }
    public var employeeType:  String? { defaults.string(forKey: Key.employeeType.rawValue)  }
    public var restaurantId:  Int?    { defaults.object(forKey: Key.restaurantId.rawValue)  as? Int }
    public var restaurantName: String? { defaults.string(forKey: Key.restaurantName.rawValue) }

    // MARK: - Clear
    public func clear() {
        Key.allCases.forEach { defaults.removeObject(forKey: $0.rawValue) }
        print("🗑️ Session cleared")
    }
}

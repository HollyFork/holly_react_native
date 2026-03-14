import Foundation
import Security

public final class KeychainManager {

    public static let shared = KeychainManager()
    private init() {}

    // MARK: - Keys
    private enum Key: String {
        case deviceToken  = "com.hollyfork.device_token"
        case accessToken  = "com.hollyfork.access_token"
        case refreshToken = "com.hollyfork.refresh_token"
    }

    // MARK: - Device Token
    public func saveDeviceToken(_ token: String) { save(token, for: .deviceToken) }
    public func getDeviceToken() -> String?        { get(.deviceToken) }
    public func deleteDeviceToken()                { delete(.deviceToken) }

    // MARK: - Access Token
    public func saveToken(_ token: String)  { save(token, for: .accessToken) }
    public func getToken() -> String?        { get(.accessToken) }
    public func deleteToken()                { delete(.accessToken) }

    // MARK: - Refresh Token
    public func saveRefreshToken(_ token: String) { save(token, for: .refreshToken) }
    public func getRefreshToken() -> String?       { get(.refreshToken) }
    public func deleteRefreshToken()               { delete(.refreshToken) }

    // MARK: - Helpers
    public func clearAuthTokens() {
        deleteToken()
        deleteRefreshToken()
    }

    public func clearAll() {
        clearAuthTokens()
        deleteDeviceToken()
    }

    // MARK: - Private Keychain CRUD
    private func save(_ value: String, for key: Key) {
        guard let data = value.data(using: .utf8) else { return }
        let query: [String: Any] = [
            kSecClass as String:       kSecClassGenericPassword,
            kSecAttrAccount as String: key.rawValue,
            kSecValueData as String:   data
        ]
        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    private func get(_ key: Key) -> String? {
        let query: [String: Any] = [
            kSecClass as String:       kSecClassGenericPassword,
            kSecAttrAccount as String: key.rawValue,
            kSecReturnData as String:  true,
            kSecMatchLimit as String:  kSecMatchLimitOne
        ]
        var result: AnyObject?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    private func delete(_ key: Key) {
        let query: [String: Any] = [
            kSecClass as String:       kSecClassGenericPassword,
            kSecAttrAccount as String: key.rawValue
        ]
        SecItemDelete(query as CFDictionary)
    }
}

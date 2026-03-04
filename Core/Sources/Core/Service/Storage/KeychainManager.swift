import Foundation
import Security

public class KeychainManager {
    
    public static let shared = KeychainManager()
    private init() {}
    
    private let service = "com.yourapp.token"
    
    // MARK: - Access Token
    
    public func saveToken(_ token: String) -> Bool {
        return save(token, forAccount: "accessToken")
    }
    
    public func getToken() -> String? {
        return get(forAccount: "accessToken")
    }
    
    public func deleteToken() {
        delete(forAccount: "accessToken")
    }
    
    // MARK: - Refresh Token
    
    public func saveRefreshToken(_ token: String) -> Bool {
        return save(token, forAccount: "refreshToken")
    }
    
    public func getRefreshToken() -> String? {
        return get(forAccount: "refreshToken")
    }
    
    public func deleteRefreshToken() {
        delete(forAccount: "refreshToken")
    }
    
    // NOUVEAU : Device Token (persistance entre sessions, valable 30 jours)
    // MARK: - Device Token
    
    public func saveDeviceToken(_ token: String) -> Bool {
        return save(token, forAccount: "deviceToken")
    }
    
    public func getDeviceToken() -> String? {
        return get(forAccount: "deviceToken")
    }
    
    public func deleteDeviceToken() {
        delete(forAccount: "deviceToken")
    }
    
    // MARK: - Clear All (logout complet)
    
    public func clearAll() {
        deleteToken()
        delete(forAccount: "refreshToken")
        // Ne pas supprimer le deviceToken au logout employé —
        // seulement lors d'une réinitialisation de l'équipement.
    }
    
    // MARK: - Helpers privés
    
    private func save(_ value: String, forAccount account: String) -> Bool {
        guard let data = value.data(using: .utf8) else { return false }
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecValueData as String: data
        ]
        SecItemDelete(query as CFDictionary)
        return SecItemAdd(query as CFDictionary, nil) == errSecSuccess
    }
    
    private func get(forAccount account: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var item: CFTypeRef?
        guard SecItemCopyMatching(query as CFDictionary, &item) == errSecSuccess,
              let data = item as? Data,
              let value = String(data: data, encoding: .utf8) else { return nil }
        return value
    }
    
    private func delete(forAccount account: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
        SecItemDelete(query as CFDictionary)
    }
}

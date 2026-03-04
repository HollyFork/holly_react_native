import Foundation

public final class TokenRefresher {
    public static let shared = TokenRefresher()
    private var timer: Timer?

    private init() {}

    public func startRefreshing() {
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 600, repeats: true) { _ in
            NetworkManager.shared.refreshToken { result in
                switch result {
                case .success:
                    print("✅ Access token mis à jour automatiquement.")
                case .failure(let error):
                    print("❌ Échec du rafraîchissement du token : \(error)")
                }
            }
        }
    }

    public func stopRefreshing() {
        timer?.invalidate()
        timer = nil
    }
}

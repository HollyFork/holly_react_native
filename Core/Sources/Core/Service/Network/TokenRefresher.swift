import Foundation
import Combine

final class TokenRefresher {

    static let shared = TokenRefresher()
    private init() {}

    private var isRefreshing = false
    private var refreshPublisher: AnyPublisher<String, AuthError>?

    func refreshIfNeeded() -> AnyPublisher<String, AuthError> {
        if let publisher = refreshPublisher, isRefreshing {
            return publisher
        }

        guard let refreshToken = KeychainManager.shared.getRefreshToken() else {
            return Fail(error: AuthError.deviceNotConfigured).eraseToAnyPublisher()
        }

        isRefreshing = true

        let publisher = performRefresh(refreshToken: refreshToken)
            .handleEvents(
                receiveOutput: { [weak self] newToken in
                    KeychainManager.shared.saveToken(newToken)
                    self?.isRefreshing    = false
                    self?.refreshPublisher = nil
                },
                receiveCompletion: { [weak self] _ in
                    self?.isRefreshing    = false
                    self?.refreshPublisher = nil
                }
            )
            .share()
            .eraseToAnyPublisher()

        self.refreshPublisher = publisher
        return publisher
    }

    private func performRefresh(refreshToken: String) -> AnyPublisher<String, AuthError> {
        guard let url = APIEndpoint.refreshToken.url else {
            return Fail(error: AuthError.networkError("URL refresh invalide")).eraseToAnyPublisher()
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = ["refresh": refreshToken]
        guard let data = try? JSONSerialization.data(withJSONObject: body) else {
            return Fail(error: AuthError.networkError("Encodage refresh échoué")).eraseToAnyPublisher()
        }
        request.httpBody = data

        return URLSession.shared.dataTaskPublisher(for: request)
            .tryMap { data, response -> String in
                guard let http = response as? HTTPURLResponse else {
                    throw AuthError.invalidResponse
                }
                guard (200...299).contains(http.statusCode) else {
                    throw AuthError.serverError("Session expirée. Veuillez vous reconnecter.")
                }
                guard
                    let json = try? JSONSerialization.jsonObject(with: data) as? [String: String],
                    let newToken = json["access"]
                else {
                    throw AuthError.decodingError
                }
                print("✅ Token refreshé automatiquement")
                return newToken
            }
            .mapError { ($0 as? AuthError) ?? AuthError.networkError($0.localizedDescription) }
            .eraseToAnyPublisher()
    }
}

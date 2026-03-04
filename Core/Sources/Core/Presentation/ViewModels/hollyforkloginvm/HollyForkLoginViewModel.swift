import SwiftUI
import Foundation
@MainActor
class HollyForkLoginViewModel: ObservableObject {

    @Published var restaurantID: String = ""
    @Published var codePin: String = ""
    @Published var uiState: HollyForkLoginUiState = .idle
    @Published var deviceToken: String?

    private let loginUseCase: Core.DeviceLoginUseCase

    init(loginUseCase: Core.DeviceLoginUseCase) {
        self.loginUseCase = loginUseCase
    }

    func login() async {
        uiState = .loading

        guard let restaurantIDInt = Int(restaurantID) else {
            uiState = .error(message: "ID restaurant invalide")
            return
        }

        print("➡️ Envoi Device Login -> ID: \(restaurantIDInt), PIN: \(codePin)")

        do {
            // ⚠️ Ici : on passe les arguments séparément
            let response = try await loginUseCase.execute(
                restaurantId: restaurantIDInt,
                pin: codePin
            )

            self.deviceToken = response.device_token
            print("✅ Device Login réussi ! Token : \(response.device_token)")
            uiState = .success(message: "Équipement connecté ✅")
        } catch {
            print("❌ Device Login failed: \(error.localizedDescription)")
            uiState = .error(message: "Erreur Device Login : \(error.localizedDescription)")
        }
    }
}

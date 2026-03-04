import SwiftUI
import Combine
import Foundation

@MainActor
class HollyForkLoginViewModel: ObservableObject {
    
    @Published var restaurantID: String = StringConstants.EMPTY_STRING
    @Published var codePin: String = StringConstants.EMPTY_STRING
    @Published var uiState: HollyForkLoginUiState = .idle
    
    private let loginUseCase: LoginUseCase
    
    init(loginUseCase: LoginUseCase) {
        self.loginUseCase = loginUseCase
    }
    
    func login() async {
        uiState = .loading
        do {
             let session = try await loginUseCase.execute(
             username: restaurantID,
             password: codePin
             )
             
             print("token: \(session.token)")
             KeychainManager.shared.saveToken(session.token)
             KeychainManager.shared.saveRefreshToken(session.refreshToken)

             uiState = .success(message: "Connexion réussie ✅")
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 5 ) {
                self.uiState = .success(message: "Connexion réussie ✅")
            }
        } catch {
            print(" Erreur login: \(error.localizedDescription)")
            uiState = .error(message: "Erreur de connexion : \(error.localizedDescription)")
        }
    }
    
}

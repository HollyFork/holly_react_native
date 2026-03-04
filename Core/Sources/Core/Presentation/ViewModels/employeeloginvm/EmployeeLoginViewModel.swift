import SwiftUI

@MainActor
class EmployeeLoginViewModel: ObservableObject {
    
    @Published var pin: String = ""
    @Published var uiState: EmployeeLoginUiState = .idle
    
    private let employeeLoginUseCase: EmployeeLoginUseCase
    private let deviceToken: String
    
    public init(employeeLoginUseCase: EmployeeLoginUseCase, deviceToken: String) {
        self.employeeLoginUseCase = employeeLoginUseCase
        self.deviceToken = deviceToken
    }
    
    public func login() async {
        uiState = .loading
        do {
            let _ = try await employeeLoginUseCase.execute(pin: pin, deviceToken: deviceToken)
            uiState = .success(message: "Connexion réussie")
        } catch {
            uiState = .error(message: "Erreur Quick Login : \(error.localizedDescription)")
        }
    }
}

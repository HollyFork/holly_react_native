import SwiftUI
import Core

public struct HollyForkLoginScreen: View {
    
    var onDeviceLoginSuccess: (String) -> Void // renvoie device_token
    
    @StateObject private var hollyForkLoginViewModel: HollyForkLoginViewModel
    
    private var isButtonActive: Bool {
        !hollyForkLoginViewModel.restaurantID.isEmpty && !hollyForkLoginViewModel.codePin.isEmpty
    }
    
    public init(onDeviceLoginSuccess: @escaping (String) -> Void, loginUseCase: Core.DeviceLoginUseCase) {
        self.onDeviceLoginSuccess = onDeviceLoginSuccess
        _hollyForkLoginViewModel = StateObject(wrappedValue: HollyForkLoginViewModel(loginUseCase: loginUseCase))
    }
    
    public var body: some View {
        ZStack {
            VStack(spacing: 30) {
                Spacer()
                
                // 💎 Ton image comme avant
                Image("ic_holly_fork_whithout_bg")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 150, height: 150)
                
                switch hollyForkLoginViewModel.uiState {
                case .success:
                    VStack(spacing: 20) {
                        Text("Connexion réussie")
                            .font(.title2)
                            .fontWeight(.semibold)
                            .foregroundColor(.black)
                        
                        Image(systemName: "checkmark.circle.fill")
                            .resizable()
                            .foregroundColor(.green)
                            .frame(width: 40, height: 40)
                    }
                    .padding(.top, 20)
                    
                default:
                    VStack(spacing: 10) {
                        CustomTextField(
                            "ID Restaurant",
                            text: $hollyForkLoginViewModel.restaurantID,
                            hasError: isError()
                        )
                        .frame(width: 300)
                        
                        CustomSecureField(
                            "Code Pin",
                            text: $hollyForkLoginViewModel.codePin,
                            hasError: isError()
                        )
                        .frame(width: 300)
                        
                        if case let .error(message) = hollyForkLoginViewModel.uiState {
                            Text(message)
                                .foregroundColor(.red)
                                .font(.caption)
                                .padding(.top, 5)
                        }
                        
                        CustomPrimaryButton(
                            title: "Connexion",
                            action: {
                                Task {
                                    await hollyForkLoginViewModel.login()
                                    if let token = hollyForkLoginViewModel.deviceToken {
                                        onDeviceLoginSuccess(token)
                                    }
                                }
                            },
                            isActive: isButtonActive
                        )
                    }
                }
                
                Spacer()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(ColorConstants.backgroundWhite)
            .ignoresSafeArea()
            .padding()
            
            if case .loading = hollyForkLoginViewModel.uiState {
                CustomLoader()
            }
        }
    }
    
    private func isError() -> Bool {
        if case .error = hollyForkLoginViewModel.uiState { return true }
        return false
    }
}

import SwiftUI
import Combine

public struct HollyForkLoginScreen: View {
    
    var onLoginSuccess: () -> Void
    
    @StateObject private var hollyForkLoginViewModel: HollyForkLoginViewModel
    
    @State private var animate = false
    
    private var isButtonActive: Bool {
        !hollyForkLoginViewModel.restaurantID.isEmpty && !hollyForkLoginViewModel.codePin.isEmpty
    }
    
    public init(onLoginSuccess: @escaping () -> Void, loginUseCase: LoginUseCase) {
        self.onLoginSuccess = onLoginSuccess
        _hollyForkLoginViewModel = StateObject(wrappedValue: HollyForkLoginViewModel(loginUseCase: loginUseCase))
    }
    
    public var body: some View {
        ZStack {
            VStack(spacing: 30) {
                Spacer()
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
                            text:$hollyForkLoginViewModel.restaurantID,
                            hasError: isError()
                        )
                        .frame(width: 300)
                        
                        CustomSecureField(
                            "Code Pin",
                            text: $hollyForkLoginViewModel.codePin,
                            hasError: isError()
                        ).frame(width: 300)
                        
                        if case let .error(message) = hollyForkLoginViewModel.uiState {
                            Text(message)
                                .foregroundColor(.red)
                                .font(.caption)
                                .padding(.top, 5)
                        }
                        
                        CustomPrimaryButton(
                            title: "Connexion",
                            action: {
                                await hollyForkLoginViewModel.login()
                            },
                            isActive: isButtonActive)
                    }
                }
                
                Spacer()
            }
            .frame(maxWidth: .infinity, maxHeight:.infinity)
            .background(ColorConstants.backgroundWhite)
            .ignoresSafeArea()
            .padding()
            .onReceive(hollyForkLoginViewModel.$uiState) { state in
                if case .success = state {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                        onLoginSuccess()
                    }
                }
            }
            
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

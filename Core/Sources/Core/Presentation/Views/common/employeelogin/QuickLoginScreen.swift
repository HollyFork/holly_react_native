import SwiftUI

public struct QuickLoginScreen: View {
    var onLoginEmployeeSuccess: () -> Void
    private let quickLoginUseCase: QuickLoginUseCase
    
    @StateObject private var viewModel: QuickLoginViewModel
    @State private var enteredCode: String = ""
    
    public init(
        onLoginEmployeeSuccess: @escaping () -> Void,
        quickLoginUseCase: QuickLoginUseCase
    ) {
        self.onLoginEmployeeSuccess = onLoginEmployeeSuccess
        self.quickLoginUseCase = quickLoginUseCase
        _viewModel = StateObject(wrappedValue: QuickLoginViewModel(quickLoginUseCase: quickLoginUseCase))
    }
    
    public var body: some View {
        VStack(spacing: 40) {
            VStack(spacing: 40) {
                Image("ic_bar_les_ombres")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 120, height: 120)
                
                Text(enteredCode.isEmpty ? "" : String(repeating: "•", count: enteredCode.count))
                    .font(.title)
                    .tracking(8)
                
                CustomNumPad(
                    mode: .login,
                    onDigitTapped: { digit in
                        onDigitTapped(digit)
                    },
                    onBackspaceTapped: {
                        onBackspaceTapped()
                    }
                )
                
                if case .error(let message) = viewModel.uiState {
                    Text(message)
                        .foregroundColor(.red)
                        .font(.caption)
                }
            }
            .frame(maxHeight: .infinity, alignment: .center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(ColorConstants.backgroundWhite)
        .ignoresSafeArea()
        .onChange(of: viewModel.uiState) { state in
            if case .success = state {
                onLoginEmployeeSuccess()
            }
        }
    }
    
    private func onDigitTapped(_ digit: String) {
        if enteredCode.count < 4 {
            enteredCode.append(digit)
        }
        
        if enteredCode.count == 4 {
            viewModel.pinCode = enteredCode
            Task {
                await viewModel.login()
            }
            enteredCode = "" // Reset pour feedback visuel
        }
    }
    
    private func onBackspaceTapped() {
        if !enteredCode.isEmpty {
            enteredCode.removeLast()
        }
    }
}

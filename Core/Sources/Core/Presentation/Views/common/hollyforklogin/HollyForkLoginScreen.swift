import SwiftUI

public struct EmployeeLoginScreen: View {
    
    var onLoginEmployeeSuccess: () -> Void
    @StateObject private var viewModel: EmployeeLoginViewModel
    @State private var enteredCode: String = ""
    
    public init(onLoginEmployeeSuccess: @escaping () -> Void,
                deviceToken: String,
                employeeLoginUseCase: Core.EmployeeLoginUseCase) {
        self.onLoginEmployeeSuccess = onLoginEmployeeSuccess
        _viewModel = StateObject(wrappedValue: EmployeeLoginViewModel(
            employeeLoginUseCase: employeeLoginUseCase,
            deviceToken: deviceToken
        ))
    }
    
    public var body: some View {
        VStack(spacing: 40) {
            Text("Employee Quick Login").font(.title)
            Text(enteredCode.isEmpty ? "" : String(repeating: "•", count: enteredCode.count))
                .font(.largeTitle)
            
            CustomNumPad(
                mode: .login,
                onDigitTapped: { digit in onDigitTapped(digit) },
                onBackspaceTapped: { onBackspaceTapped() }
            )
            
            if case .error(let message) = viewModel.uiState {
                Text(message).foregroundColor(.red)
            }
        }
        .padding()
        .onChange(of: viewModel.uiState) { state in
            if case .success = state { onLoginEmployeeSuccess() }
        }
    }
    
    private func onDigitTapped(_ digit: String) {
        if enteredCode.count < 4 { enteredCode.append(digit) }
        if enteredCode.count == 4 {
            viewModel.pin = enteredCode
            Task { await viewModel.login() }
        }
    }
    
    private func onBackspaceTapped() {
        if !enteredCode.isEmpty { enteredCode.removeLast() }
    }
}

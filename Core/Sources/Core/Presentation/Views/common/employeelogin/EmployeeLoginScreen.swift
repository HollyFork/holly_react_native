
/*
public struct EmployeeLoginScreen: View {
    
    var onLoginEmployeeSuccess: () -> Void
    let employeeLoginUseCase: EmployeeLoginUseCase

    @State private var enteredCode: String = StringConstants.EMPTY_STRING
    
    public init(onLoginEmployeeSuccess: @escaping () -> Void) {
        self.onLoginEmployeeSuccess = onLoginEmployeeSuccess
    }
    
    public var body: some View {
        VStack(spacing: 40) {
            VStack(spacing: 40) {
                
                Image("ic_bar_les_ombres")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 120, height: 120)
                
                Text(enteredCode.isEmpty ?
                     StringConstants.EMPTY_STRING :
                        String(repeating: "•",
                               count: enteredCode.count))
                    .font(.title)
                    .tracking(8)
                
                CustomNumPad(
                    mode: NumPadMode.login,
                    onDigitTapped: { digit in
                        onDigitTapped(digit)
                    },
                    onBackspaceTapped: {
                        onBackspaceTapped()
                    }
                )
                
                
            }
            .frame(maxHeight: .infinity, alignment: .center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(ColorConstants.backgroundWhite)
        .ignoresSafeArea()
    }
    
    private func onDigitTapped(_ digit: String) {
        if enteredCode.count < 4 {
            enteredCode.append(digit)
        }
        if enteredCode.count >= 4 {
            onLoginEmployeeSuccess()
        }
    }
    
    private func onBackspaceTapped() {
        if !enteredCode.isEmpty {
            enteredCode.removeLast()
        }
    }
}

*/
import SwiftUI

public struct EmployeeLoginScreen: View {
    
    var onLoginEmployeeSuccess: () -> Void
    private let employeeLoginUseCase: EmployeeLoginUseCase
    
    @StateObject private var viewModel: EmployeeLoginViewModel
    @State private var enteredCode: String = StringConstants.EMPTY_STRING
    
    public init(
        onLoginEmployeeSuccess: @escaping () -> Void,
        employeeLoginUseCase: EmployeeLoginUseCase
    ) {
        self.onLoginEmployeeSuccess = onLoginEmployeeSuccess
        self.employeeLoginUseCase = employeeLoginUseCase
        _viewModel = StateObject(wrappedValue: EmployeeLoginViewModel(employeeLoginUseCase: employeeLoginUseCase))
    }
    
    public var body: some View {
        VStack(spacing: 40) {
            VStack(spacing: 40) {
                
                Image("ic_bar_les_ombres")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 120, height: 120)
                
                Text(enteredCode.isEmpty ?
                     StringConstants.EMPTY_STRING :
                        String(repeating: "•",
                               count: enteredCode.count))
                    .font(.title)
                    .tracking(8)
                
                CustomNumPad(
                    mode: NumPadMode.login,
                    onDigitTapped: { digit in
                        onDigitTapped(digit)
                    },
                    onBackspaceTapped: {
                        onBackspaceTapped()
                    }
                )
                
                // Error message
                if case .error(let message) = viewModel.uiState {
                    Text(message)
                        .foregroundColor(.red)
                }
                
            }
            .frame(maxHeight: .infinity, alignment: .center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(ColorConstants.backgroundWhite)
        .ignoresSafeArea()
        
        // Navigation on success
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
            viewModel.pin = enteredCode
            Task {
                await viewModel.login()
            }
        }
    }
    
    private func onBackspaceTapped() {
        if !enteredCode.isEmpty {
            enteredCode.removeLast()
        }
    }
}


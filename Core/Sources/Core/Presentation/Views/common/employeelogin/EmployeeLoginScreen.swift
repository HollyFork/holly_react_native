
import SwiftUI

public struct EmployeeLoginScreen: View {
    
    var onLoginEmployeeSuccess: () -> Void
    
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


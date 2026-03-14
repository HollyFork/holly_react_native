
import SwiftUI

enum NumPadMode {
    case basic
    case login
    case search
    case payment
}

struct CustomNumPad: View {
    let mode: NumPadMode
    let onDigitTapped: (String) -> Void
    let onPrintTapped: (() -> Void)?
    let onSearchTapped: (() -> Void)?
    let onBackspaceTapped: (() -> Void)?
    let onCollectPaymentTap: (() -> Void)?
    let onClosePaymentTap: (() -> Void)?
    
    @State private var enteredNumber: String = StringConstants.EMPTY_STRING
    
    private let digits = [
        ["7", "8", "9"],
        ["4", "5", "6"],
        ["1", "2", "3"]
    ]
    
    private var maxDigits: Int {
        return mode == .login ? 4 : 3
    }
    
    init(
        mode: NumPadMode,
        onDigitTapped: @escaping (String) -> Void,
        onPrintTapped: (() -> Void)? = nil,
        onSearchTapped: (() -> Void)? = nil,
        onBackspaceTapped: (() -> Void)? = nil,
        onCollectPaymentTap: (() -> Void)? = nil,
        onClosePaymentTap: (() -> Void)? = nil
    ) {
        self.mode = mode
        self.onDigitTapped = onDigitTapped
        self.onPrintTapped = onPrintTapped
        self.onSearchTapped = onSearchTapped
        self.onBackspaceTapped = onBackspaceTapped
        self.onCollectPaymentTap = onCollectPaymentTap
        self.onClosePaymentTap = onClosePaymentTap
    }
    

    
    var body: some View {
        VStack(spacing: 20) {
            
            if mode != .login {
                HStack(spacing: 20) {

                    if mode == .payment {
                        Text(formattedPayment)
                            .font(.largeTitle)
                            .fontWeight(.semibold)
                            .frame(width: 160, height: 70)
                            .background(Color.white)
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.gray.opacity(0.5), lineWidth: 1)
                            )
                        Button(action: {
                            handleBackspace()
                        }) {
                            Image(systemName: "delete.left.fill")
                                .font(.title)
                                .foregroundColor(.black)
                                .frame(width: 70, height: 70)
                                .background(Color.white)
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.gray.opacity(0.5), lineWidth: 1)
                                )
                        }
                    }
                    else {
                        Text(enteredNumber.isEmpty ? StringConstants.EMPTY_STRING : enteredNumber)
                            .font(.largeTitle)
                            .fontWeight(.semibold)
                            .frame(width: 160, height: 70)
                            .background(Color.white)
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.gray.opacity(0.5), lineWidth: 1)
                            )
                    }

                    if mode == .basic {
                        Button(action: {
                            handleBackspace()
                        }) {
                            Image(systemName: "delete.left.fill")
                                .font(.title)
                                .foregroundColor(.black)
                                .frame(width: 70, height: 70)
                                .background(Color.white)
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.gray.opacity(0.5), lineWidth: 1)
                                )
                        }
                    }
                }
            }

            
            ForEach(digits, id: \.self) { row in
                HStack(spacing: 20) {
                    ForEach(row, id: \.self) { digit in
                        CustomDigitButton(digit: digit) {
                            handleDigitTap(digit)
                        }
                    }
                }
            }
            
            HStack(spacing: 20) {
                switch mode {
                case .basic:
                    CustomIconButton(systemName: "printer.fill") {
                        onPrintTapped?()
                    }
                    
                    CustomDigitButton(digit: "0") {
                        handleDigitTap("0")
                    }
                    
                    CustomIconDigitButton(systemName: "magnifyingglass") {
                        onSearchTapped?()
                    }
                    
                case .login:
                    Spacer().frame(width: 70, height: 70)
                    
                    CustomDigitButton(digit: "0") {
                        handleDigitTap("0")
                    }
                    
                    CustomIconButton(systemName: "delete.left.fill") {
                        onBackspaceTapped?()
                    }
                    
                case .search:
                    CustomIconButton(systemName: "printer.fill") {
                        onPrintTapped?()
                    }
                    
                    Spacer().frame(width: 30)
                    
                    CustomIconDigitButton(systemName: "magnifyingglass") {
                        onSearchTapped?()
                    }
                case .payment:
                    CustomIconButton(systemName: "xmark.circle.fill") {
                        onClosePaymentTap?()
                    }
                    
                    CustomDigitButton(digit: "00") {
                        handleDigitTap("00")
                    }
                    
                    CustomDigitButton(digit: "0") {
                        handleDigitTap("0")
                    }
                    
                    CustomIconDigitButton(systemName: "eurosign.circle.fill") {
                        onCollectPaymentTap?()
                    }
                    
                }
                
            }
        }
    }
    
    private func handleDigitTap(_ digit: String) {
        
        if mode == .payment {
            
            if enteredNumber.count >= 9 {
                return
            }
            
            if digit == "00" {
                enteredNumber.append(contentsOf: "00")
            } else {
                enteredNumber.append(digit)
            }
            
            onDigitTapped(digit)
            return
        }
        
        if enteredNumber.count >= maxDigits {
            return
        }
        
        onDigitTapped(digit)
        
        if mode != .login {
            enteredNumber.append(digit)
        }
    }

    private func handleBackspace() {
        
        if mode == .payment {
            if !enteredNumber.isEmpty {
                enteredNumber.removeLast()
            }
            onBackspaceTapped?()
            return
        }
        
        if !enteredNumber.isEmpty {
            enteredNumber.removeLast()
        }
        onBackspaceTapped?()
    }

    private var formattedPayment: String {
        let digits = enteredNumber
        
        if digits.isEmpty { return "0,00" }
        
        if digits.count == 1 {
            return "0,0\(digits)"
        }
        else if digits.count == 2 {
            return "0,\(digits)"
        }
        else {
            let euros = String(digits.dropLast(2))
            let cents = String(digits.suffix(2))
            return "\(euros),\(cents)"
        }
    }


}

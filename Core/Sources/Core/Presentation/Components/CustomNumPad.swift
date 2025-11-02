
import SwiftUI


struct CustomNumPad: View {
    let mode: NumPadMode
    let onDigitTapped: (String) -> Void
    let onPrintTapped: (() -> Void)?
    let onSearchTapped: (() -> Void)?
    let onBackspaceTapped: (() -> Void)?
    
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
        onBackspaceTapped: (() -> Void)? = nil
    ) {
        self.mode = mode
        self.onDigitTapped = onDigitTapped
        self.onPrintTapped = onPrintTapped
        self.onSearchTapped = onSearchTapped
        self.onBackspaceTapped = onBackspaceTapped
    }
    
    var body: some View {
        VStack(spacing: 20) {
            
            if mode != .login {
                HStack(spacing: 20) {
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
                }
            }
        }
    }
    
    private func handleDigitTap(_ digit: String) {
        if enteredNumber.count >= maxDigits {
            return
        }
        
        onDigitTapped(digit)
        
        if mode != .login {
            enteredNumber.append(digit)
        }
    }
    
    private func handleBackspace() {
        if !enteredNumber.isEmpty {
            enteredNumber.removeLast()
        }
        onBackspaceTapped?()
    }
}

import SwiftUI

struct PaymentInputView: View {
    let tableNumber: String
    let totalRemaining: Double
    var onAmountEntered: (Double) -> Void
    @Environment(\.dismiss) var dismiss
    
    @State private var enteredAmount: String = ""
    
    var displayAmount: String {
        if enteredAmount.isEmpty {
            return "0,00"
        }

        let digits = enteredAmount.replacingOccurrences(of: ",", with: "").replacingOccurrences(of: ".", with: "")
        if let value = Int(digits) {
            let amount = Double(value) / 100.0
            return String(format: "%.2f", amount).replacingOccurrences(of: ".", with: ",")
        }
        return "0,00"
    }
    
    var amountValue: Double {
        let digits = enteredAmount.replacingOccurrences(of: ",", with: "").replacingOccurrences(of: ".", with: "")
        if let value = Int(digits) {
            return Double(value) / 100.0
        }
        return 0.0
    }
    
    var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 20) {
                HStack {
                    Text("Table \(tableNumber)")
                        .font(.system(size: 28, weight: .bold))
                    Spacer()
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 28))
                            .foregroundColor(.gray)
                    }
                }
                .padding()
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("Montant à saisir")
                        .font(.system(size: 22, weight: .semibold))
                    Text(String(format: "%.2f € restant", totalRemaining))
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.orange)
                    
                    Text("\(displayAmount) €")
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(.primary)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding()
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(12)
                }
                .padding()
                
                Spacer()
                
                CustomNumPad(
                    mode: .payment,
                    onDigitTapped: { digit in
                        enteredAmount.append(digit)
                    },
                    onPrintTapped: {},
                    onSearchTapped: {},
                    onCollectPaymentTap: {
                        onAmountEntered(amountValue)
                        dismiss()
                    },
                    onClosePaymentTap: {
                        dismiss()
                    }
                )
                .scaleEffect(0.6)
                .frame(maxHeight: geometry.size.height * 0.3, alignment: .center)
                
                Spacer()
            }
            .background(Color(UIColor.systemGroupedBackground))
        }
    }
}

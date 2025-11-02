import SwiftUI

struct CustomDigitButton: View {
    let digit: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(digit)
                .font(.title)
                .fontWeight(.bold)
                .frame(width: 70, height: 70)
                .background(Color.white)
                .foregroundStyle(.black)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.black, lineWidth: 2)
                )
        }
    }
}

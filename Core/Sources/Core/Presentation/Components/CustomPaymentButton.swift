

import SwiftUI

struct CustomPaymentButton: View {
    let icon: String
    let title: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                
                Image(icon)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 24, height: 24)
                Text(title)
                    .font(.system(size: 18, weight: .medium))
                Spacer()
                Image(systemName: "chevron.right")
            }
            .padding()
            .background(Color.white)
            .foregroundColor(.black)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.gray.opacity(0.3), lineWidth: 1)
            )
        }
    }
}


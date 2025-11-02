import SwiftUI

struct CustomPrimaryButton: View {
    let title: String
    let action: () async -> Void
    var isActive: Bool = true
    
    var body: some View {
        Button(action: {
            Task {
                await action()
            }
        }) {
            Text(title)
                .foregroundColor(.white)
                .font(.headline)
                .padding()
                .background(isActive ? ColorConstants.primaryOrange : ColorConstants.black150.opacity(0.8))
                .cornerRadius(42)
                .contentMargins(20)
                .padding(.vertical, 10)
                .padding(.horizontal, 40)
        }
        .disabled(!isActive)
        
        
    }
}

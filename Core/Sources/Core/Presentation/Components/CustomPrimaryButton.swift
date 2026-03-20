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



struct CustomSecondaryButton: View {
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
                .foregroundColor(isActive ? ColorConstants.primaryOrange : Color.gray)
                .font(.headline)
                .padding()
                .background(isActive ? Color.white : ColorConstants.black150.opacity(0.8))
                .overlay(
                    RoundedRectangle(cornerRadius: 42)
                        .stroke(isActive ? ColorConstants.primaryOrange : Color.gray, lineWidth: 2)
                )
                .cornerRadius(42)
                .contentMargins(20)
                .padding(.vertical, 10)
                .padding(.horizontal, 40)
        }
        .disabled(!isActive)
    }
}

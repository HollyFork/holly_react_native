import SwiftUI


struct CustomIconDigitButton: View {
    let systemName: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.title)
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

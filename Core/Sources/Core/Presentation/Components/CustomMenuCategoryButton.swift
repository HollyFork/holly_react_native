import SwiftUI


struct CustomMenuCategoryButton: View {
    let title: String
    let bgColor: Color
    let txtColor: Color
    var action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 18, weight: .medium))
                .foregroundColor(txtColor)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 18)
                .background(bgColor)
                .overlay(Rectangle().stroke(Color.black, lineWidth: 1))
        }
        .buttonStyle(PlainButtonStyle())
    }
}


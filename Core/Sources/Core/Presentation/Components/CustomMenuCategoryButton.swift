import SwiftUI

struct CustomMenuCategoryButton: View {
    let title: String
    let bgColor: Color
    let txtColor: Color
    let iconName: String
    var action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(iconName)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 28, height: 28)   
                
                Text(title)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(txtColor)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .padding(.horizontal, 12)
            .background(bgColor)
            .overlay(Rectangle().stroke(Color.black, lineWidth: 1))
        }
        .buttonStyle(PlainButtonStyle())
    }
}

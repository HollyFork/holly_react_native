import SwiftUI

struct CustomPanelWithAction: View {
    let title: String
    let action: () -> Void
    let iconName: String
    
    var body: some View {
        ZStack {
            Rectangle()
                .fill(Color.black)
            
            HStack {
                Text(title)
                    .foregroundColor(.white)
                    .font(.headline)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.leading)
                
                Button(action: action) {
                    ZStack {
                        Circle()
                            .fill(ColorConstants.primaryOrange)
                            .frame(width: 44, height: 44)
                        
                        Image(iconName)
                            .resizable()
                            .scaledToFit()
                            .frame(width: 24, height: 24)
                            .foregroundColor(.white)
                    }
                }
                .padding(.trailing, 5)
            }
            .frame(height: 60)
        }
    }
}

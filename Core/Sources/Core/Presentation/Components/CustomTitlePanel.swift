

import SwiftUI
struct CustomTitlePanel: View {
    let title: String
    
    var body: some View {
        Rectangle()
            .fill(Color.black)
            .overlay(
                Text(title)
                    .foregroundColor(.white)
                    .font(.headline)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
            )
    }
}

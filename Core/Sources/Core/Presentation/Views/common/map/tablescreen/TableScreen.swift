import SwiftUI

public struct TableScreen: View {
    
    let tableNumber: String
    
    public init(tableNumber: String) {
        self.tableNumber = tableNumber
    }
    public  var body: some View {
        VStack(spacing: 40) {
            Text("test")
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .background(ColorConstants.backgroundWhite)
        .safeAreaInset(edge: .top) {
            HStack {
                Text("Table : \(tableNumber)")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.black)
                
                Spacer()
            }
            .padding(.horizontal, 30)
            .padding(.vertical, 15)
            .background(Color.white)
        }
    }
}

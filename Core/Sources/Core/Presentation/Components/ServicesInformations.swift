import SwiftUI

struct ServicesInformations: View {
    let showIcon: Bool
    let title: String
    let items: [String]
    
    init(showIcon: Bool = true, title: String, items: [String]) {
        self.showIcon = showIcon
        self.title = title
        self.items = items
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .center, spacing: 12) {
                if showIcon {
                    ZStack {
                        Circle()
                            .fill(Color.red)
                            .frame(width: 24, height: 24)
                        
                        Image(systemName: "exclamationmark")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                    }
                }
                
                Text(title)
                    .font(.title3)
                    .fontWeight(.medium)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            
            VStack(alignment: .leading, spacing: 6) {
                ForEach(items, id: \.self) { item in
                    HStack(alignment: .top, spacing: 8) {
                        Text("•")
                            .font(.body)
                        Text(item)
                            .font(.body)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
            }
            .padding(.leading, 36)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

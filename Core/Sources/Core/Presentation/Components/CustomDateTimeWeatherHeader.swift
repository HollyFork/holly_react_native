import SwiftUI

struct CustomDateTimeWeatherHeader: View {
    let date: String
    let time: String
    let showWeatherIcon: Bool
    
    var body: some View {
        VStack(spacing: 0) {
            HStack(alignment: .center, spacing: 12) {
                Text(date)
                    .font(.system(size: 22, weight: .regular))
                
                Spacer()
                
                Text(time)
                    .font(.system(size: 22, weight: .regular))
                
                Spacer()
                
                if showWeatherIcon {
                    ZStack {
                        Image(systemName: "cloud.fill")
                            .font(.system(size: 28))
                            .foregroundColor(.gray.opacity(0.6))
                            .offset(x: -6, y: 0)
                        
                        Image(systemName: "sun.max.fill")
                            .font(.system(size: 22))
                            .foregroundColor(.yellow)
                            .offset(x: 6, y: -6)
                    }
                    .frame(width: 45, height: 35)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(Color.white)
            
            Rectangle()
                .fill(Color.black)
                .frame(height: 2)
        }
    }
}



import SwiftUI

struct CustomReservationCard: View {
    let hourReservation: String
    let numberPersonReservation: Int
    
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white)
                .shadow(color: Color.black.opacity(0.15), radius: 8, x: 0, y: 4)
            
            VStack {
                Text(hourReservation)
                    .font(.system(size: 12, weight: .bold))
                    .padding(.top, 12)
                
                Spacer()
                
                HStack {
                    Image(systemName: "person.2.fill")
                        .font(.system(size: 14))
                        .foregroundColor(.black)
                    
                    Spacer()
                    
                    Text("\(numberPersonReservation) pax")
                        .font(.system(size: 12, weight: .semibold))
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 12)
            }
        }
        .frame(width: 130, height: 55)
    }
}


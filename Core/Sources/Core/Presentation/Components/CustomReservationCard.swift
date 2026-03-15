import SwiftUI

struct CustomReservationCard: View {
    let hourReservation: String
    let numberPersonReservation: Int
    var onTap: () -> Void = {}

    var body: some View {
        Button(action: onTap) {
            ZStack {
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.white)
                    .shadow(color: Color.black.opacity(0.15), radius: 8, x: 0, y: 4)

                VStack {
                    Text(hourReservation)
                        .font(.system(size: 10, weight: .bold))  // légèrement réduit
                        .padding(.top, 8)

                    Spacer()

                    HStack {
                        Image(systemName: "person.2.fill")
                            .font(.system(size: 12))
                            .foregroundColor(.black)
                        Spacer()
                        Text("\(numberPersonReservation) pax")
                            .font(.system(size: 10, weight: .semibold))
                    }
                    .padding(.horizontal, 10)
                    .padding(.bottom, 8)
                }
            }
            .frame(maxWidth: .infinity, minHeight: 50)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

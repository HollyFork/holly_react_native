
import SwiftUI


struct CustomReservationFields: View {
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Réservation")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.black.opacity(0.8))
            
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.white)
                .frame(maxWidth: .infinity)
                .frame(height: 80)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                )
        }
    }
    
}

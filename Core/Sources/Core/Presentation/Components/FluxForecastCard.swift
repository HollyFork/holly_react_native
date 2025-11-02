

import SwiftUI

struct FluxForecastCard: View {
    let data: FluxForecastData
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 16) {
                Text("Prévision Flux")
                    .font(.headline)
                    .bold()
                
                HStack {
                    periodColumn(title: "Matin", value: data.morningValue, trendUp: data.morningTrendUp)
                    Spacer()
                    periodColumn(title: "Midi", value: data.noonValue, trendUp: data.noonTrendUp)
                    Spacer()
                    periodColumn(title: "Soir", value: data.eveningValue, trendUp: data.eveningTrendUp)
                }
            }
            
            Spacer()
            
            VStack(spacing: 8) {
                Image(systemName: "cloud.sun.fill")
                    .font(.system(size: 40))
                    .foregroundStyle(.yellow, .gray)
                
                HStack {
                    Text("\(data.minTemp)°")
                    Text("-")
                    Text("\(data.maxTemp)°C")
                }
                .font(.headline)
            }
            .frame(width: 120, height: 120)
            .background(Color.white)
            .cornerRadius(20)
            .shadow(color: .gray.opacity(0.3), radius: 4, x: 2, y: 2)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(20)
    }
    
    private func periodColumn(title: String, value: Int, trendUp: Bool) -> some View {
        VStack {
            Text(title)
                .font(.headline)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
            
            HStack(spacing: 4) {
                Text("\(value)")
                    .font(.title2)
                    .bold()
                    .lineLimit(1)
                    .minimumScaleFactor(0.5)
                    .layoutPriority(1)
                Image(systemName: trendUp ? "arrow.up" : "arrow.down")
                    .foregroundColor(trendUp ? .green : .red)
            }
            .fixedSize(horizontal: true, vertical: false)
        }
    }
}

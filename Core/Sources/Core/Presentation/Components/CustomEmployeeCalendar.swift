import SwiftUI

struct CustomEmployeeCalendar: View {
    @State private var days: [DaySchedule] = []
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(Array(days.enumerated()), id: \.element.id) { index, day in
                    DayCard(day: day, isLast: index == days.count - 1)
                }
            }
            
        }
        .onAppear {
            generateDays()
        }
    }
    
    private func generateDays() {
        let calendar = Calendar.current
        let today = Date()
        
        days = (0..<7).compactMap { offset in
            guard let date = calendar.date(byAdding: .day, value: offset, to: today) else {
                return nil
            }
            return DaySchedule(
                date: date,
                morningSlot: "11H00\n16H30",
                eveningSlot: "18H30\n00H00",
                nightSlot: "9H00"
            )
        }
    }
}

struct DayCard: View {
    let day: DaySchedule
    let isLast: Bool
    @State private var rating: Int = Int.random(in: 6...9)
    
    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color(red: 0.2, green: 0.3, blue: 0.35))
                    .frame(width: 110, height: 50)
                
                Text("\(rating)/10")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.white)
            }
            
            TimeSlotCard(timeSlot: day.morningSlot)
            TimeSlotCard(timeSlot: day.eveningSlot)
            TimeSlotCard(timeSlot: day.nightSlot, isSingleTime: true)
        }
        .overlay(alignment: .bottomTrailing) {
            Text("Heure de travaille : 46h / Semaine")
                .font(.system(size: 9, weight: .medium))
                .foregroundColor(.gray)
                .italic()
                .padding(.trailing, 8)
                .padding(.bottom, -20)
                .opacity(isLast ? 1 : 0)
        }
    }
}

struct TimeSlotCard: View {
    let timeSlot: String
    var isSingleTime: Bool = false
    
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color(red: 0.2, green: 0.3, blue: 0.35), lineWidth: 1.5)
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.white)
                )
                .frame(width: 110, height: isSingleTime ? 45 : 65)
            
            if isSingleTime {
                Text(timeSlot)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(Color(red: 0.2, green: 0.3, blue: 0.35))
            } else {
                VStack(spacing: 2) {
                    let times = timeSlot.split(separator: "\n")
                    if times.count == 2 {
                        Text(String(times[0]))
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(Color(red: 0.2, green: 0.3, blue: 0.35))
                        
                        Rectangle()
                            .fill(Color(red: 0.2, green: 0.3, blue: 0.35))
                            .frame(width: 80, height: 1.5)
                        
                        Text(String(times[1]))
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(Color(red: 0.2, green: 0.3, blue: 0.35))
                    }
                }
            }
        }
    }
}

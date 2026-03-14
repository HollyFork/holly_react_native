import SwiftUI

// MARK: - Main Calendar View
struct CustomEmployeeCalendar: View {
    @ObservedObject var viewModel: EmployeeViewModel

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(alignment: .top, spacing: 12) {
                switch viewModel.planningUiState {
                case .loading:
                    ForEach(0..<5, id: \.self) { _ in
                        ShimmerDayCard()
                    }

                case .success(let days, let totalHours):
                    ForEach(Array(days.prefix(7).enumerated()), id: \.element.id) { index, day in
                        DayCard(
                            day: day,
                            isLast: index == days.prefix(6).count - 1,
                            totalWeekHours: totalHours
                        )
                    }

                case .empty:
                    VStack(spacing: 8) {
                        Text("Aucun shift planifié")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()

                case .error(let message):
                    VStack(spacing: 8) {
                        Text(message)
                            .font(.caption)
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()

                case .idle:
                    EmptyView()
                }
            }
            .padding(.horizontal, 16)
        }
        .frame(height: 300)
        .task { await viewModel.loadPlanning() }
        .refreshable { await viewModel.refreshPlanning() }
    }
}

// MARK: - Day Card View
struct DayCard: View {
    let day: DaySchedule
    let isLast: Bool
    let totalWeekHours: Double

    private let cardColor = Color(red: 0.2, green: 0.3, blue: 0.35)

    var body: some View {
        VStack(spacing: 8) {
            // Header — date
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(cardColor)
                    .frame(width: 110, height: 50)
                Text(day.displayDate)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.white)
            }

            // Slots
            if let slot = day.morningSlot    { TimeSlotCard(timeSlot: slot, label: "Matin") }
            if let slot = day.afternoonSlot  { TimeSlotCard(timeSlot: slot, label: "A-midi") }
            if let slot = day.eveningSlot    { TimeSlotCard(timeSlot: slot, label: "Soir") }
            if let slot = day.nightSlot      { TimeSlotCard(timeSlot: slot, label: "Nuit") }

            // Repos si aucun créneau
            if [day.morningSlot, day.afternoonSlot, day.eveningSlot, day.nightSlot].allSatisfy({ $0 == nil }) {
                VStack(spacing: 4) {
                    Text("Repos")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.gray.opacity(0.5))
                }
                .frame(width: 110, height: 65)
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                )
            }

            // DIVIDER entre créneaux/repos et heures totales
            Divider()
                .frame(height: 1)
                .background(cardColor.opacity(0.3))
                .padding(.horizontal, 4)

            // Heures du jour
            Text(formatHours(day.totalHours))
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(day.totalHours > 0 ? cardColor : .gray.opacity(0.4))
                .frame(maxWidth: .infinity, alignment: .center)
        }
        .padding(.bottom, 4) // Petit padding en bas
        .overlay(alignment: .bottomTrailing) {
            // Total semaine — sur la dernière carte
            Text("Semaine : \(formatHours(totalWeekHours))")
                .font(.system(size: 9, weight: .medium))
                .foregroundColor(.gray)
                .italic()
                .padding(.trailing, 8)
                .padding(.bottom, -18)
                .opacity(isLast ? 1 : 0)
        }
    }

    private func formatHours(_ hours: Double) -> String {
        let h   = Int(hours)
        let min = Int((hours - Double(h)) * 60)
        return String(format: "%02dH%02d", h, min)
    }
}


// MARK: - Time Slot Card
struct TimeSlotCard: View {
    let timeSlot: String
    var label: String = ""

    private let cardColor = Color(red: 0.2, green: 0.3, blue: 0.35)

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8)
                .stroke(cardColor, lineWidth: 1.5)
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.white)
                )
                .frame(width: 110, height: 65)

            let times = timeSlot.split(separator: "\n")
            VStack(spacing: 2) {
                if !label.isEmpty {
                    Text(label)
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(cardColor.opacity(0.6))
                }

                if times.count == 2 {
                    Text(String(times[0]))
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(cardColor)

                    Rectangle()
                        .fill(cardColor)
                        .frame(width: 80, height: 1.5)

                    Text(String(times[1]))
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(cardColor)
                } else {
                    Text(timeSlot)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(cardColor)
                }
            }
        }
    }
}

import SwiftUI

struct CustomEmployeeCalendar: View {
    @ObservedObject var viewModel: EmployeeViewModel

    private let slotHeight: CGFloat = 65
    private let slotCount:  Int     = 4
    private let cardWidth:  CGFloat = 110
    private let headerH:    CGFloat = 50
    private let spacing:    CGFloat = 8
    private let footerH:    CGFloat = 30

    var computedCardHeight: CGFloat {
        headerH + CGFloat(slotCount) * (slotHeight + spacing) + footerH + 16
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(alignment: .top, spacing: 12) {
                    switch viewModel.planningUiState {
                    case .loading:
                        ForEach(0..<5, id: \.self) { _ in
                            ShimmerDayCard()
                                .frame(width: cardWidth, height: computedCardHeight)
                        }
                    case .success(let days, let totalHours):
                        ForEach(Array(days.prefix(7).enumerated()), id: \.element.id) { _, day in
                            DayCard(
                                day: day,
                                totalWeekHours: totalHours,
                                slotHeight: slotHeight,
                                cardWidth: cardWidth
                            )
                            .frame(width: cardWidth, height: computedCardHeight)
                        }
                    case .empty:
                        Text("Aucun shift planifié")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                            .frame(maxWidth: .infinity)
                            .padding()
                    case .error(let message):
                        Text(message)
                            .font(.caption)
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                            .frame(maxWidth: .infinity)
                            .padding()
                    case .idle:
                        EmptyView()
                    }
                }
                .padding(.horizontal, 16)
            }
            .frame(height: computedCardHeight)
            .clipped()

            switch viewModel.planningUiState {
            case .success(_, let totalHours):
                Text("Heure de travail : \(formatTotalHours(totalHours)) / semaine")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(Color(red: 0.2, green: 0.3, blue: 0.35))
                    .frame(maxWidth: .infinity, alignment: .trailing)
            default:
                EmptyView()
            }
        }
        .task { await viewModel.loadPlanning() }
        .refreshable { await viewModel.refreshPlanning() }
    }

    private func formatTotalHours(_ hours: Double) -> String {
        let h   = Int(hours)
        let min = Int((hours - Double(h)) * 60)
        return min == 0 ? "\(h)h" : String(format: "%dh%02d", h, min)
    }

    struct DayCard: View {
        let day:            DaySchedule
        let totalWeekHours: Double
        let slotHeight:     CGFloat
        let cardWidth:      CGFloat

        private let cardColor = Color(red: 0.2, green: 0.3, blue: 0.35)

        var body: some View {
            VStack(alignment: .center, spacing: 8) {
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(cardColor)
                        .frame(width: cardWidth, height: 50)
                    Text(day.displayDate)
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                }

                slotRow(slot: day.morningSlot,   label: "Matin")
                slotRow(slot: day.afternoonSlot, label: "A-midi")
                slotRow(slot: day.eveningSlot,   label: "Soir")
                slotRow(slot: day.nightSlot,     label: "Nuit")

                Divider()
                    .frame(height: 1)
                    .background(cardColor.opacity(0.3))
                    .padding(.horizontal, 4)

                Text(formatHours(day.totalHours))
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(day.totalHours > 0 ? cardColor : .gray.opacity(0.4))
                    .frame(maxWidth: .infinity, alignment: .center)
            }
            .padding(.bottom, 4)
        }

        @ViewBuilder
        private func slotRow(slot: String?, label: String) -> some View {
            if let slot = slot {
                TimeSlotCard(timeSlot: slot, label: label)
                    .frame(width: cardWidth, height: slotHeight)
            } else {
                Color.clear
                    .frame(width: cardWidth, height: slotHeight)
            }
        }

        private func formatHours(_ hours: Double) -> String {
            let h   = Int(hours)
            let min = Int((hours - Double(h)) * 60)
            return String(format: "%02dH%02d", h, min)
        }
    }

    struct TimeSlotCard: View {
        let timeSlot: String
        var label:    String = ""

        private let cardColor = Color(red: 0.2, green: 0.3, blue: 0.35)

        var body: some View {
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .stroke(cardColor, lineWidth: 1.5)
                    .background(
                        RoundedRectangle(cornerRadius: 8).fill(Color.white)
                    )

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
}

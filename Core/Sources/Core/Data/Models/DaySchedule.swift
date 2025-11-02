
import SwiftUI

struct DaySchedule: Identifiable {
    let id = UUID()
    let date: Date
    let morningSlot: String
    let eveningSlot: String
    let nightSlot: String    
    
    var dayNumber: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d"
        return formatter.string(from: date)
    }
    
    var monthNumber: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "M"
        return formatter.string(from: date)
    }
    
    var displayDate: String {
        "\(dayNumber)/\(monthNumber)"
    }
}

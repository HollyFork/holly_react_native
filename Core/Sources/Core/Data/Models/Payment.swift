

import SwiftUI

struct Payment: Identifiable {
    let id = UUID()
    let method: String
    let amount: Double
}

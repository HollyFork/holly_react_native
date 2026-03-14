import SwiftUI
import Foundation

public extension Color {
    init(argb hex: UInt32) {
        let a = Double((hex & 0xFF000000) >> 24) / 255.0
        let r = Double((hex & 0x00FF0000) >> 16) / 255.0
        let g = Double((hex & 0x0000FF00) >> 8) / 255.0
        let b = Double(hex & 0x000000FF) / 255.0
        self.init(red: r, green: g, blue: b, opacity: a)
    }
}

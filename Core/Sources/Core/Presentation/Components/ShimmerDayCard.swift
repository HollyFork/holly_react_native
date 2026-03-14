//
//  ShimmerDayCard.swift
//  Core
//
//  Created by Hadj Rabah on 14/03/2026.
//


import SwiftUI

struct ShimmerDayCard: View {
    var body: some View {
        VStack(spacing: 8) {
            // Rating placeholder
            RoundedRectangle(cornerRadius: 8)
                .fill(Color(red: 0.88, green: 0.88, blue: 0.9))
                .frame(width: 110, height: 50)
                .shimmer()

            // 3 slot placeholders
            ForEach(0..<3, id: \.self) { i in
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color(red: 0.88, green: 0.88, blue: 0.9))
                    .frame(width: 110, height: i == 2 ? 45 : 65)
                    .shimmer()
            }
        }
    }
}

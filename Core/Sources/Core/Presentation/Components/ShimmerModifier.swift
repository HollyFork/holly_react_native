 

import SwiftUI

struct ShimmerModifier: ViewModifier {
    @State private var phase: CGFloat = -1

    func body(content: Content) -> some View {
        content
            .overlay(
                GeometryReader { geo in
                    LinearGradient(
                        gradient: Gradient(stops: [
                            .init(color: .clear,                                  location: 0),
                            .init(color: Color.white.opacity(0.6),                location: 0.4),
                            .init(color: Color.white.opacity(0.6),                location: 0.6),
                            .init(color: .clear,                                  location: 1)
                        ]),
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                    .frame(width: geo.size.width * 2)
                    .offset(x: geo.size.width * phase)
                    .animation(
                        .linear(duration: 1.2).repeatForever(autoreverses: false),
                        value: phase
                    )
                }
                .clipped()
            )
            .onAppear { phase = 1 }
    }
}

extension View {
    func shimmer() -> some View {
        modifier(ShimmerModifier())
    }
}


import SwiftUI

struct CustomLoader: View {
    @State private var animate = false

    var body: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()
                .allowsHitTesting(true)

            Image("ic_holly_fork_whithout_bg")
                .resizable()
                .scaledToFit()
                .frame(width: 100, height: 100)
                .scaleEffect(animate ? 1.2 : 0.8)
                .animation(
                    Animation.easeInOut(duration: 0.8)
                        .repeatForever(autoreverses: true),
                    value: animate
                )
                .onAppear {
                    animate = true
                }
        }
    }
}

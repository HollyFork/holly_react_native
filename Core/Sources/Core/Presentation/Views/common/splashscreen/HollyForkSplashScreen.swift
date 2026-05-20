import SwiftUI

public struct HollyForkSplashScreen: View {
    
    public init() {}

    public var body: some View {
        ZStack {
            VStack(spacing: 30) {
                Image("ic_holy_fork_whithout_bg")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 150, height: 150)
                
                Text("Bienvenue sur Holy Fork")
                    .foregroundColor(.black)
                
            }
            .frame(maxWidth: .infinity, maxHeight:.infinity)
            .background(ColorConstants.backgroundWhite)
            .ignoresSafeArea()
            .padding()
        }
    }
    
}

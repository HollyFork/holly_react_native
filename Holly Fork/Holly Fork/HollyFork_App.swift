import SwiftUI
import Core

@main
struct HollyFork_App: App {
    @Environment(\.scenePhase) private var scenePhase
    @UIApplicationDelegateAdaptor(Core.AppDelegate.self) var appDelegate
    
    // DI simplifiée - pas dans App
    var body: some Scene {
        WindowGroup {
            MainView()
                .onAppear {
                    if DeviceHelper.isIPhone {
                        OrientationManager.lockOrientation(.portrait, andRotateTo: .portrait)
                    } else if DeviceHelper.isIPad {
                        OrientationManager.lockOrientation(.landscapeRight, andRotateTo: .landscapeRight)
                    }
                }
        }
        .onChange(of: scenePhase) { newPhase in
            if newPhase == .background || newPhase == .inactive {
                handleAppBackground()
            }
        }
    }
    
    // MARK: - Private (dehors du body)
    private func handleAppBackground() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 30) {
            if KeychainManager.shared.getToken() != nil {
                KeychainManager.shared.clearAll()
                print("🔒 Auto-logout en background")
            }
        }
    }
}

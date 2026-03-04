import SwiftUI
import Core
internal import Combine

@main
struct HollyFork_App: App {

    @Environment(\.scenePhase) private var scenePhase
    @UIApplicationDelegateAdaptor(Core.AppDelegate.self) var appDelegate

    // On utilise un StateObject pour pouvoir appeler logoutEmployee() sur MainView
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            MainView(appState: appState)
                .onAppear {
                    if DeviceHelper.isIPhone {
                        OrientationManager.lockOrientation(.portrait, andRotateTo: .portrait)
                    } else if DeviceHelper.isIPad {
                        OrientationManager.lockOrientation(.landscapeRight, andRotateTo: .landscapeRight)
                    }
                }
        }
        .onChange(of: scenePhase) { _, newPhase in
            // ✅ iOS 17+ : two-parameter closure (corrige le warning deprecated)
            if newPhase == .background || newPhase == .inactive {
                appState.requestEmployeeLogout()
            }
        }
    }
}

// Objet partagé entre App et MainView pour déclencher le logout depuis l'extérieur

final class AppState: ObservableObject {
    /// Positionné à true par l'App quand elle passe en background.
    /// MainView l'observe pour déclencher le logout.
    @Published var shouldLogoutEmployee: Bool = false

    func requestEmployeeLogout() {
        shouldLogoutEmployee = true
    }
}

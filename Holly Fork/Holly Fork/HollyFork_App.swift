import SwiftUI
import Core

@main
struct HollyFork_App: App {
    
    @Environment(\.scenePhase) private var scenePhase
    @UIApplicationDelegateAdaptor(Core.AppDelegate.self) var appDelegate

    let logoutUseCase: Core.LogoutUseCase = {
        let logoutRemoteDataSource: Core.LogoutRemoteDataSourceImpl = Core.LogoutRemoteDataSourceImpl()
        let logoutRepository: Core.LogoutRepositoryImpl = Core.LogoutRepositoryImpl(remoteDataSource: logoutRemoteDataSource)
        return Core.LogoutUseCaseImpl(repository: logoutRepository )
    }()

    
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
                logoutIfNeeded()
            }
        }
    }
    
    private func logoutIfNeeded() {
      /*  guard Core.KeychainManager.shared.getToken() != nil else { return }
        logoutUseCase.execute { result in
            switch result {
            case .success(let message):
                print("Logout automatique:", message)
            case .failure(let error):
                print("Erreur logout:", error.localizedDescription)
            }
        } */
    }
}

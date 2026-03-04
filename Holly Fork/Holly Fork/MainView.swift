import SwiftUI
import Core

// MARK: - MainView

struct MainView: View {

    @ObservedObject var appState: AppState

    @State private var currentScreen: Core.Screen = .hollyForkSplashScreen
    @State private var tableNumber: String = Core.StringConstants.EMPTY_STRING
    @State private var deviceToken: String = ""

    // Device Login UseCase
    let deviceLoginUseCase: Core.DeviceLoginUseCase = {
        let remote = Core.DeviceLoginRemoteDataSourceImpl()
        let repo = Core.DeviceLoginRepositoryImpl(remoteDataSource: remote)
        return Core.DeviceLoginUseCaseImpl(repository: repo)
    }()

    // Employee Login UseCase
    let employeeLoginUseCase: Core.EmployeeLoginUseCase = {
        let remote = Core.EmployeeLoginRemoteDataSourceImpl()
        let repo = Core.EmployeeLoginRepositoryImpl(remoteDataSource: remote)
        return Core.EmployeeLoginUseCaseImpl(repository: repo)
    }()
    
    
    let planningUseCase: Core.GetMyPlanningUseCase = {
        let remote = Core.PlanningRemoteDataSourceImpl()
        let repo = Core.PlanningRepositoryImpl(remote: remote)
        return Core.GetMyPlanningUseCaseImpl(repository: repo)
    }()

    var body: some View {
        ZStack {
            switch currentScreen {
                
            // ─── Splash ──────────────────────────────────────────────────
            case .hollyForkSplashScreen:
                HollyForkSplashScreen()
                    .onAppear { handleSplashFinished() }
                    .transition(.opacity)

            // ─── Device Login (first time setup) ─────────────────────────
            case .hollyForkLogin:
                HollyForkLoginScreen(
                    onDeviceLoginSuccess: { token in
                        print("✅ MainView : DeviceToken reçu -> \(token)")
                        self.deviceToken = token
                        withAnimation { currentScreen = .employeeLogin }
                    },
                    loginUseCase: deviceLoginUseCase
                )
                .transition(.opacity)

            // ─── Employee Login (chaque ouverture de l'app) ───────────────
            case .employeeLogin:
                EmployeeLoginScreen(
                    onLoginEmployeeSuccess: {
                        print("✅ EmployeeLogin : connexion réussie")
                        withAnimation { currentScreen = .home }
                    },
                    deviceToken: deviceToken,
                    employeeLoginUseCase: employeeLoginUseCase
                )
                .transition(.opacity)

            // ─── App ──────────────────────────────────────────────────────
            case .home:
                HomeScreen(
                    onHomeButtonClicked: { currentScreen = .employeeLogin },
                    onShiftButtonClicked: { currentScreen = .map },
                    getMyPlanningUseCase : planningUseCase
                )

            case .map:
                MapScreen(
                    onHomeButtonClicked: { currentScreen = .home },
                    onTableButtonClicked: { table in
                        tableNumber = table
                        currentScreen = .table
                    }
                )

            case .table:
                TableScreen(tableNumber: tableNumber)

            case .testScreen:
                TableScreen(tableNumber: tableNumber)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(ColorConstants.backgroundWhite)
        .preferredColorScheme(.light)
        .onChange(of: appState.shouldLogoutEmployee) { _, shouldLogout in
            if shouldLogout {
                logoutEmployee()
                appState.shouldLogoutEmployee = false
            }
        }
    }

    /// Appelé après le splash (2s). Décide où aller selon l'état du Keychain.
    private func handleSplashFinished() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation {
                if let savedToken = Core.KeychainManager.shared.getDeviceToken(), !savedToken.isEmpty {
                    // ✅ L'équipement est déjà configuré → employee login directement
                    print("📱 Device token trouvé en Keychain, skip device login")
                    self.deviceToken = savedToken
                    currentScreen = .employeeLogin
                } else {
                    // ⚙️ Première installation ou token expiré → device login
                    print("⚙️ Pas de device token, affichage device login")
                    currentScreen = .hollyForkLogin
                }
            }
        }
    }

    /// Efface uniquement les tokens JWT de l'employé.
    /// Le device token est conservé pour éviter de refaire le setup.
    func logoutEmployee() {
        Core.KeychainManager.shared.deleteToken()
        Core.KeychainManager.shared.deleteRefreshToken()
        Core.SessionCache.shared.clearEmployeeSession()
        Core.TokenRefresher.shared.stopRefreshing()
        print("🔒 Session employé effacée — device token conservé")

        withAnimation {
            // Si on est dans l'app (pas déjà sur l'écran login), on renvoie vers employee login
            if currentScreen != .employeeLogin && currentScreen != .hollyForkLogin {
                currentScreen = .employeeLogin
            }
        }
    }
}

import SwiftUI
import Core

struct MainView: View {
    @State private var currentScreen: Screen = .hollyForkSplashScreen
    @State private var tableNumber: String = Core.StringConstants.EMPTY_STRING
    

    
    
    
    var body: some View {
        ZStack {
            switch currentScreen {
            case .hollyForkSplashScreen:
                HollyForkSplashScreen()
                    .onAppear {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                            // Vérifier si device déjà configuré
                            let hasDeviceToken = KeychainManager.shared.getDeviceToken() != nil
                            let hasAccessToken = KeychainManager.shared.getToken() != nil
                            
                            withAnimation(.easeInOut) {
                                if hasDeviceToken && hasAccessToken {
                                    currentScreen = .employee
                                } else if hasDeviceToken {
                                    currentScreen = .employeeLogin
                                } else {
                                    currentScreen = .deviceLogin
                                }
                            }
                        }
                    }
                    .transition(.opacity)
                
            case .deviceLogin:
                DeviceLoginScreen(
                    onDeviceConfigured: {
                        withAnimation(.easeInOut) {
                            currentScreen = .employeeLogin
                        }
                    },
                    deviceLoginUseCase: deviceLoginUseCase
                )
                .transition(.opacity)
                
            case .employeeLogin:
                QuickLoginScreen(
                    onLoginEmployeeSuccess: {
                        withAnimation(.easeInOut) {
                            currentScreen = .employee
                        }
                    },
                    quickLoginUseCase: quickLoginUseCase
                )
                .transition(.opacity)
                
            case .employee:
                EmployeeScreen(
                       onHomeButtonClicked:  { performLogout() },
                       onShiftButtonClicked: {
                           withAnimation(.easeInOut) { currentScreen = .home }
                       },
                       getWeekPlanningUseCase:getWeekPlanningUseCase,
                       employeeId:   SessionManager.shared.employeeId  ?? 0,
                       restaurantId: SessionManager.shared.restaurantId ?? 0
                   )
                .transition(.opacity)
                
            case .home:
                MapScreen(
                    onHomeButtonClicked: {
                        withAnimation(.easeInOut) {
                            currentScreen = .employeeLogin
                        }
                    },
                    onTableButtonClicked: { tableNumber in
                        self.tableNumber = tableNumber
                        withAnimation(.easeInOut) {
                            currentScreen = .table
                        }
                    }
                )
                .transition(.opacity)
                
            case .table:
                TableScreen(tableNumber: tableNumber)
                    .onAppear {
                        // Auto-redirect si pas connecté
                        if KeychainManager.shared.getToken() == nil {
                            withAnimation(.easeInOut) {
                                currentScreen = .employeeLogin
                            }
                        }
                    }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(ColorConstants.backgroundWhite)
        .preferredColorScheme(.light)
    }
    
    // MARK: - Private Methods (Callbacks compatibles)
    private func performLogout() {
        logoutUseCase.execute { result in
            DispatchQueue.main.async {
                switch result {
                case .success:
                    print("✅ Logout réussi")
                case .failure(let error):
                    print("❌ Logout error: \(error)")
                }
                withAnimation(.easeInOut) {
                    currentScreen = .employeeLogin
                }
            }
        }
    }
}

enum Screen {
    case hollyForkSplashScreen
    case deviceLogin
    case employeeLogin
    case employee
    case home
    case table
}


extension MainView {
    var deviceLoginUseCase: DeviceLoginUseCase { DependencyContainer.shared.deviceLoginUseCase }
    var quickLoginUseCase:  QuickLoginUseCase  { DependencyContainer.shared.quickLoginUseCase }
    var logoutUseCase:      LogoutUseCase      { DependencyContainer.shared.logoutUseCase }
    var getWeekPlanningUseCase:   GetWeekPlanningUseCase     { DependencyContainer.shared.getWeekPlanningUseCase }
}

import SwiftUI
import Core

struct MainView: View {
    @State private var currentScreen: Screen = .hollyForkSplashScreen
    @State private var tableNumber: String = Core.StringConstants.EMPTY_STRING
    @State private var tableOrderItems: [OrderItem] = []
    
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
                                    currentScreen = .quicklogin
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
                            currentScreen = .quicklogin
                        }
                    },
                    deviceLoginUseCase: deviceLoginUseCase
                )
                .transition(.opacity)
                
            case .quicklogin:
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
                HomeScreen(
                    onHomeButtonClicked:  {
                        withAnimation(.easeInOut) { currentScreen = .quicklogin }
                    },
                    onTableButtonClicked: { tableNumber in
                        self.tableNumber = tableNumber
                        withAnimation(.easeInOut) { currentScreen = .table }
                    },
                    getSallesUseCase:       getSallesUseCase,
                    getTablesUseCase:       getTablesUseCase,
                    getCommandesUseCase:    getCommandesUseCase,
                    getReservationsUseCase: getReservationsUseCase,
                    getArticlesUseCase:     getArticlesUseCase,
                    getCategoriesUseCase:   getCategoriesUseCase,
                    restaurantId:           SessionManager.shared.restaurantId ?? 0
                )
                .transition(.opacity)
                
            case .table:
                TableScreen(
                    tableNumber:    tableNumber,
                    orderViewModel: TableOrderViewModel()
                )
                .onAppear {
                    if KeychainManager.shared.getToken() == nil {
                        withAnimation(.easeInOut) {
                            currentScreen = .quicklogin
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
                    currentScreen = .quicklogin
                }
            }
        }
    }
}

enum Screen {
    case hollyForkSplashScreen
    case deviceLogin
    case quicklogin
    case employee
    case home
    case table
}


extension MainView {
    var deviceLoginUseCase:        DeviceLoginUseCase         { DependencyContainer.shared.deviceLoginUseCase }
    var quickLoginUseCase:         QuickLoginUseCase          { DependencyContainer.shared.quickLoginUseCase }
    var logoutUseCase:             LogoutUseCase              { DependencyContainer.shared.logoutUseCase }
    var getWeekPlanningUseCase:    GetWeekPlanningUseCase     { DependencyContainer.shared.getWeekPlanningUseCase }
    var getArticlesUseCase:        GetArticlesUseCase         { DependencyContainer.shared.getArticlesUseCase }
    var getCategoriesUseCase:      GetCategoriesUseCase       { DependencyContainer.shared.getCategoriesUseCase }
    var getSallesUseCase:          GetSallesUseCase           { DependencyContainer.shared.getSallesUseCase }
    var getTablesUseCase:          GetTablesUseCase           { DependencyContainer.shared.getTablesUseCase }
    var getCommandesUseCase:       GetCommandesUseCase        { DependencyContainer.shared.getCommandesUseCase }
    var getReservationsUseCase:    GetReservationsUseCase     { DependencyContainer.shared.getReservationsUseCase }
    
}

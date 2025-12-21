
import SwiftUI
import Core

struct MainView: View {
    
    @State private var currentScreen: Core.Screen = .home
    @State private var tableNumber: String = Core.StringConstants.EMPTY_STRING
    
    
    let loginUseCase: Core.LoginUseCase = {
        let loginRemoteDataSource: Core.LoginRemoteDataSource = Core.LoginRemoteDataSourceImpl()
        let loginRepository: Core.LoginRepository = Core.LoginRepositoryImpl(loginRemoteDataSource: loginRemoteDataSource)
        return Core.LoginUseCaseImpl(loginRepository: loginRepository  )
    }()
    
    let employeeLoginUseCase: Core.EmployeeLoginUseCase = {
        let employeeLoginRemoteDataSource: Core.EmployeeLoginRemoteDataSource = Core.EmployeeLoginRemoteDataSourceImpl()
        let employeeLoginRepository: Core.EmployeeLoginRepository = Core.EmployeeLoginRepositoryImpl(employeeLoginRemoteDataSource: employeeLoginRemoteDataSource)
        return Core.EmployeeLoginUseCaseImpl(
            employeeLoginRepository: employeeLoginRepository
        )
    }()

    var body: some View {
        ZStack {
            switch currentScreen {
                
            case .hollyForkSplashScreen:
                HollyForkSplashScreen()
                    .onAppear {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                            withAnimation(.easeInOut) {
                                currentScreen = .hollyForkLogin
                            }
                        }
                    }
                    .transition(.opacity)
                
            case .hollyForkLogin:
                HollyForkLoginScreen(
                    onLoginSuccess: {
                        withAnimation(.easeInOut) {
                            currentScreen = .employeeLogin
                        }
                    },
                    loginUseCase: loginUseCase
                )
                .transition(.opacity)
                
            case .employeeLogin:
                EmployeeLoginScreen(
                    onLoginEmployeeSuccess: {
                        currentScreen = .home
                    },
                    employeeLoginUseCase: employeeLoginUseCase
                ).transition(.opacity)
                
            case .home:
                HomeScreen(
                    onHomeButtonClicked: {
                        currentScreen = .employeeLogin
                    },
                    onShiftButtonClicked: {
                        currentScreen = .map
                    }
                )
                
            case .map:
                MapScreen(
                    onHomeButtonClicked: {
                        currentScreen = .employeeLogin
                    },
                    onTableButtonClicked: { string in
                        tableNumber = string
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
        
    }
}

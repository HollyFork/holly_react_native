

import SwiftUI

import SwiftUI

public struct HomeScreenIphone: View {
    
    var onHomeButtonClicked: () -> Void
    var onShiftButtonClicked: () -> Void
    
    @StateObject private var viewModel: HomeViewModel
    
    public init(
        onHomeButtonClicked: @escaping () -> Void,
        onShiftButtonClicked: @escaping () -> Void,
        getMyPlanningUseCase: GetMyPlanningUseCase
    ) {
        self.onHomeButtonClicked = onHomeButtonClicked
        self.onShiftButtonClicked = onShiftButtonClicked
        
        _viewModel = StateObject(
            wrappedValue: HomeViewModel(
                getMyPlanningUseCase: getMyPlanningUseCase
            )
        )
    }
    
    public var body: some View {
        
        let cache = SessionCache.shared
        let employeeName = "\(cache.employeeFirstName ?? "") \(cache.employeeLastName ?? "")"
        let employeeRole = cache.employeeRole ?? ""
        
        VStack(spacing: 24) {
            
            EmployeeTypeProfile(
                employeeName: employeeName.isEmpty ? "Nom inconnu" : employeeName,
                typeEmployee: employeeRole.isEmpty ? "Rôle inconnu" : employeeRole,
                profileImage: Image(systemName: "person.fill")
            )
            .frame(maxWidth: .infinity, alignment: .leading)
            
            // 🔥 AFFICHAGE RESULTAT API
            switch viewModel.uiState {
                
            case .idle:
                EmptyView()
                
            case .loading:
                ProgressView("Chargement planning...")
                
            case .success:
                ScrollView {
                    Text(viewModel.shiftsText)
                        .font(.system(size: 14))
                        .foregroundColor(.black)
                }
                .frame(maxHeight: 200)
                
            case .error(let message):
                Text("Erreur : \(message)")
                    .foregroundColor(.red)
            }
            
            CustomEmployeeCalendar()
            
            FluxForecastCard(
                data: FluxForecastData(
                    morningValue: 42,
                    noonValue: 132,
                    eveningValue: 212,
                    morningTrendUp: false,
                    noonTrendUp: true,
                    eveningTrendUp: true,
                    minTemp: 10,
                    maxTemp: 25
                )
            )
            
            CustomReservationFields()
            
            HStack {
                CustomIconButton(systemName: "house.fill") {
                    onHomeButtonClicked()
                }
                
                Spacer()
                
                CustomShiftButton(title: "Shift") {
                    onShiftButtonClicked()
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(ColorConstants.backgroundWhite)
        .ignoresSafeArea()
        .padding()
        .task {
            await viewModel.loadMyPlanning()
        }
    }
}


import SwiftUI

public struct HomeScreenIpad: View {
    
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
            wrappedValue: HomeViewModel(getMyPlanningUseCase: getMyPlanningUseCase)
        )
    }
    
    public var body: some View {
        
        let cache = SessionCache.shared
        let employeeName = "\(cache.employeeFirstName ?? "") \(cache.employeeLastName ?? "")"
        let employeeRole = cache.employeeRole ?? ""
        
        ZStack(alignment: .topLeading) {
            ColorConstants.backgroundWhite.ignoresSafeArea()
            
            VStack(alignment: .leading, spacing: 16) {
                
                EmployeeTypeProfile(
                    employeeName: employeeName.isEmpty ? "Nom inconnu" : employeeName,
                    typeEmployee: employeeRole.isEmpty ? "Rôle inconnu" : employeeRole,
                    profileImage: Image(systemName: "person.fill")
                )
                .frame(maxWidth: .infinity, alignment: .leading)
                
                // 🔥 AFFICHAGE PLANNING
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
                            .padding(.top, 10)
                    }
                    .frame(maxWidth: 600)
                    
                case .error(let message):
                    Text("Erreur : \(message)")
                        .foregroundColor(.red)
                }
            }
            .padding(.top, 20)
            .padding(.leading, 40)
            
            VStack {
                Spacer()
                HStack {
                    CustomIconButton(systemName: "house.fill") {
                        onHomeButtonClicked()
                    }
                    
                    Spacer()
                    
                    CustomShiftButton(title: "Shift") {
                        onShiftButtonClicked()
                    }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 32)
            }
        }
        .task {
            await viewModel.loadMyPlanning()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

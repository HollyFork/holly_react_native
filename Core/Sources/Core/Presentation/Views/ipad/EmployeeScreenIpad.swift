import SwiftUI



public struct EmployeeScreenIpad: View {
    @ObservedObject var viewModel: EmployeeViewModel

    public var body: some View {
        ZStack(alignment: .topLeading) {
            // Background horizontal + bottom seulement
            ColorConstants.backgroundWhite
                .ignoresSafeArea(.container, edges: [.horizontal, .bottom])
            
            // Profile — haut gauche (respecte safe area)
            EmployeeTypeProfile(
                employeeName: viewModel.employeeName,
                typeEmployee: viewModel.employeeType,
                profileImage: Image(systemName: "person.fill")
            )
            .padding(.top, 16)
            .padding(.leading, 40)

            // Contenu principal — droite
            HStack {
                Spacer()
                VStack(spacing: 24) {
                    CustomEmployeeCalendar(viewModel: viewModel)
                    FluxForecastCard(
                        data: FluxForecastData(
                            morningValue:   42,
                            noonValue:      132,
                            eveningValue:   212,
                            morningTrendUp: false,
                            noonTrendUp:    true,
                            eveningTrendUp: true,
                            minTemp:        10,
                            maxTemp:        25
                        )
                    )

                    VStack(alignment: .leading, spacing: 8) {
                        CustomReservationFields()
                    }
                }
                .frame(maxWidth: 500)
                .padding(.top, 80)
                .padding(.leading, 300)
                .padding(.trailing, 24)
            }
        }
        // Safe area verticale contrôlée
        .safeAreaPadding(.top, 8)
        .safeAreaPadding(.bottom, 12)
    }
}

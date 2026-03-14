import SwiftUI


public struct EmployeeScreenIphone: View {
    @ObservedObject var viewModel: EmployeeViewModel

    public var body: some View {
        VStack(spacing: 24) {
            EmployeeTypeProfile(
                employeeName: viewModel.employeeName,
                typeEmployee: viewModel.employeeType,
                profileImage: Image(systemName: "person.fill")
            )
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, 12)

            CustomEmployeeCalendar(viewModel: viewModel)
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
        }
        .padding(.horizontal, 16)
        .background(ColorConstants.backgroundWhite.ignoresSafeArea(.container, edges: .horizontal))
        .safeAreaPadding(.top, 8)
        .safeAreaPadding(.bottom, 8)
    }
}

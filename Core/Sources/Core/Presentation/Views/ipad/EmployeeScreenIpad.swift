
import SwiftUI

public struct EmployeeScreenIpad: View {
    @ObservedObject var viewModel: EmployeeViewModel
 
    public var body: some View {
        GeometryReader { geo in
            HStack(alignment: .top, spacing: 0) {
                VStack(alignment: .leading, spacing: 0) {
                    EmployeeTypeProfile(
                        employeeName: viewModel.employeeName,
                        typeEmployee: viewModel.employeeType,
                        profileImage: Image(systemName: "person.fill")
                    )
                    .padding(.top, geo.safeAreaInsets.top + 16)
                    .padding(.horizontal, 24)
 
                    Spacer()
                }
                .frame(width: geo.size.width * 0.30)
 
                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: 24) {
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
 
                        VStack(alignment: .leading, spacing: 8) {
                            CustomReservationFields()
                        }
                    }
                    .padding(.top, geo.safeAreaInsets.top + 24)
                    .padding(.trailing, 24)
                    .padding(.bottom, geo.safeAreaInsets.bottom + 24)
                }
                .frame(width: geo.size.width * 0.70)
            }
            .frame(width: geo.size.width, height: geo.size.height)
            .background(ColorConstants.backgroundWhite.ignoresSafeArea())
        }
    }
}

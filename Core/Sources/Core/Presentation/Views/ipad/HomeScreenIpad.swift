
import SwiftUI

public struct HomeScreenIpad: View {
    
    var onHomeButtonClicked: () -> Void
    var onShiftButtonClicked: () -> Void
    
    public init(onHomeButtonClicked: @escaping () -> Void,
                onShiftButtonClicked: @escaping () -> Void) {
        self.onHomeButtonClicked = onHomeButtonClicked
        self.onShiftButtonClicked = onShiftButtonClicked
    }
    
    public var body: some View {
        ZStack(alignment: .topLeading) {
            ColorConstants.backgroundWhite.ignoresSafeArea()
            
            EmployeeTypeProfile(
                employeeName: "Michel",
                typeEmployee: "Runner",
                profileImage: Image(systemName: "person.fill")
            )
            .padding(.top, 20)
            .padding(.leading, 40)
            HStack {
                Spacer()
                
                VStack(spacing: 24) {
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
                    
                    VStack(alignment: .leading, spacing: 8) {
                        CustomReservationFields()
                    }
                }
                .frame(maxWidth: 500)
                .padding(.top, 100)
                .padding(.leading, 300)
                .padding(.trailing, 24)
            }
            
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
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

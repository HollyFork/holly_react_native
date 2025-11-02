

import SwiftUI


public struct HomeScreenIphone: View {
    
    var onHomeButtonClicked: () -> Void
    var onShiftButtonClicked: () -> Void
    
    public init(onHomeButtonClicked: @escaping () -> Void,
                onShiftButtonClicked: @escaping () -> Void) {
        self.onHomeButtonClicked = onHomeButtonClicked
        self.onShiftButtonClicked = onShiftButtonClicked
    }
    
    public  var body: some View {
        VStack(spacing: 40) {
            VStack(spacing: 40) {
                
                EmployeeTypeProfile(
                    employeeName: "Michel",
                    typeEmployee: "Runner",
                    profileImage: Image(systemName: "person.fill")
                ).frame(maxWidth: .infinity, alignment: .leading)
                
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
                
            }.frame(maxHeight: .infinity, alignment: .center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(ColorConstants.backgroundWhite)
        .ignoresSafeArea()
        .padding()
    }
    
}

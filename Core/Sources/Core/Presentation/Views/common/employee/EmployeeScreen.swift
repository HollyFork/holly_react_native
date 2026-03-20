import SwiftUI

public struct EmployeeScreen: View {

    var onHomeButtonClicked:  () -> Void
    var onShiftButtonClicked: () -> Void

    @StateObject private var viewModel: EmployeeViewModel

    public init(
        onHomeButtonClicked:  @escaping () -> Void,
        onShiftButtonClicked: @escaping () -> Void,
        getWeekPlanningUseCase: GetWeekPlanningUseCase,
        employeeId:   Int,
        restaurantId: Int
    ) {
        self.onHomeButtonClicked  = onHomeButtonClicked
        self.onShiftButtonClicked = onShiftButtonClicked
        _viewModel = StateObject(wrappedValue: EmployeeViewModel(
            getWeekPlanningUseCase: getWeekPlanningUseCase,
            employeeId:   employeeId,
            restaurantId: restaurantId
        ))
    }

    public var body: some View {
        Group {
            if DeviceHelper.isIPhone {
                EmployeeScreenIphone(viewModel: viewModel)
            } else if DeviceHelper.isIPad {
                EmployeeScreenIpad(viewModel: viewModel)
            }
        }
        .safeAreaInset(edge: .top) {
            Color.clear.frame(height: 0)
        }
        .safeAreaInset(edge: .bottom) {
            HStack {
                CustomIconButton(systemName: "house.fill") { onHomeButtonClicked() }
                Spacer()
                CustomShiftButton(title: "Shift") { onShiftButtonClicked() }
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 12)
            .background(ColorConstants.backgroundWhite)
        }
    }
}

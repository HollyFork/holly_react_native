
import SwiftUI

public struct HomeScreen: View {
    
    var onHomeButtonClicked: () -> Void
    var onShiftButtonClicked: () -> Void
    private let getMyPlanningUseCase: GetMyPlanningUseCase
    
    public init(
        onHomeButtonClicked: @escaping () -> Void,
        onShiftButtonClicked: @escaping () -> Void,
        getMyPlanningUseCase: GetMyPlanningUseCase
    ) {
        self.onHomeButtonClicked = onHomeButtonClicked
        self.onShiftButtonClicked = onShiftButtonClicked
        self.getMyPlanningUseCase = getMyPlanningUseCase
    }
    
    public var body: some View {
        Group {
            if DeviceHelper.isIPhone {
                HomeScreenIphone(
                    onHomeButtonClicked: onHomeButtonClicked,
                    onShiftButtonClicked: onShiftButtonClicked,
                    getMyPlanningUseCase: getMyPlanningUseCase
                )
            } else if DeviceHelper.isIPad {
                HomeScreenIpad(
                    onHomeButtonClicked: onHomeButtonClicked,
                    onShiftButtonClicked: onShiftButtonClicked,
                    getMyPlanningUseCase: getMyPlanningUseCase
                )
            }
        }
    }
}

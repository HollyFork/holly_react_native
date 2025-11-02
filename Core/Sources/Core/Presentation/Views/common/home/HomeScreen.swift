
import SwiftUI

public struct HomeScreen: View {
    
    var onHomeButtonClicked: () -> Void
    var onShiftButtonClicked: () -> Void
    
    public init(onHomeButtonClicked: @escaping () -> Void,
                onShiftButtonClicked: @escaping () -> Void) {
        self.onHomeButtonClicked = onHomeButtonClicked
        self.onShiftButtonClicked = onShiftButtonClicked
    }
    public var body: some View {
        Group {
            if DeviceHelper.isIPhone {
                HomeScreenIphone(
                    onHomeButtonClicked: onHomeButtonClicked,
                    onShiftButtonClicked: onShiftButtonClicked
                )
            } else if DeviceHelper.isIPad {
                HomeScreenIpad(
                    onHomeButtonClicked: onHomeButtonClicked,
                    onShiftButtonClicked: onShiftButtonClicked
                )
            }
        }
    }
}



import SwiftUI

public struct MapScreen: View {
    
    @State private var tableNumberInput: String = StringConstants.EMPTY_STRING
    var onHomeButtonClicked: () -> Void
    var onTableButtonClicked: (String) -> Void
    
    @State private var isLoading: Bool = false
    @State private var enteredCode: String = StringConstants.EMPTY_STRING
    
    public init(onHomeButtonClicked: @escaping () -> Void,
                onTableButtonClicked: @escaping (String) -> Void) {
        self.onHomeButtonClicked = onHomeButtonClicked
        self.onTableButtonClicked = onTableButtonClicked
    }
    
    public var body: some View {
        Group {
            if DeviceHelper.isIPhone {
                MapScreenIphone(
                    onHomeButtonClicked: onHomeButtonClicked,
                    onTableButtonClicked: onTableButtonClicked
                )
            } else if DeviceHelper.isIPad {
                MapScreenIpad(
                    onHomeButtonClicked: onHomeButtonClicked,
                    onTableButtonClicked: onTableButtonClicked
                )
            }
        }
    }
    
}

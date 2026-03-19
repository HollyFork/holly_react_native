import SwiftUI

public struct HomeScreen: View {

    var onHomeButtonClicked:  () -> Void
    var onTableButtonClicked: (String) -> Void

    @StateObject private var viewModel = HomeViewModel()

    public init(
        onHomeButtonClicked:  @escaping () -> Void,
        onTableButtonClicked: @escaping (String) -> Void
    ) {
        self.onHomeButtonClicked  = onHomeButtonClicked
        self.onTableButtonClicked = onTableButtonClicked
    }

    public var body: some View {
        Group {
            if DeviceHelper.isIPhone {
                HomeScreenIphone(
                    onHomeButtonClicked:  onHomeButtonClicked,
                    onTableButtonClicked: onTableButtonClicked,
                    viewModel:            viewModel
                )
            } else {
                HomeScreenIpad(
                    onHomeButtonClicked:  onHomeButtonClicked,
                    onTableButtonClicked: onTableButtonClicked,
                    viewModel:            viewModel
                )
            }
        }
        .task { await viewModel.loadAll() }
    }
}

import SwiftUI

public struct HomeScreen: View {

    var onHomeButtonClicked:  () -> Void
    var onTableButtonClicked: (String) -> Void

    @StateObject private var viewModel: HomeViewModel

    public init(
        onHomeButtonClicked:  @escaping () -> Void,
        onTableButtonClicked: @escaping (String) -> Void,
        getSallesUseCase:       GetSallesUseCase,
        getTablesUseCase:       GetTablesUseCase,
        getCommandesUseCase:    GetCommandesUseCase,
        getReservationsUseCase: GetReservationsUseCase,
        getArticlesUseCase:     GetArticlesUseCase,
        getCategoriesUseCase:   GetCategoriesUseCase,
        restaurantId: Int
    ) {
        self.onHomeButtonClicked  = onHomeButtonClicked
        self.onTableButtonClicked = onTableButtonClicked
        _viewModel = StateObject(wrappedValue: HomeViewModel(
            getSallesUseCase:       getSallesUseCase,
            getTablesUseCase:       getTablesUseCase,
            getCommandesUseCase:    getCommandesUseCase,
            getReservationsUseCase: getReservationsUseCase,
            getArticlesUseCase:     getArticlesUseCase,
            getCategoriesUseCase:   getCategoriesUseCase,
            restaurantId:           restaurantId
        ))
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

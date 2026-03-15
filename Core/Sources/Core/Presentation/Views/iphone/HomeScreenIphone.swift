import SwiftUI

public struct HomeScreenIphone: View {

    var onHomeButtonClicked:  () -> Void
    var onTableButtonClicked: (String) -> Void
    @ObservedObject var viewModel: HomeViewModel

    @State private var tableNumberInput: String = ""
    @State private var isLoading:        Bool   = false

    public var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                Image("test_map_restaurant")
                    .resizable()
                    .scaledToFill()
                    .frame(width: geometry.size.width, height: geometry.size.height * 0.5)
                    .clipped()

                VStack(spacing: 0) {
                    HStack(alignment: .top, spacing: 16) {
                        ServicesInformations(
                            showIcon: true,
                            title:    "Rupture :",
                            items:    unavailableArticles()
                        )
                        .frame(
                            maxWidth:  geometry.size.width * 0.4,
                            maxHeight: geometry.size.height * 0.35,
                            alignment: .topLeading
                        )
                        .layoutPriority(1)

                        CustomNumPad(
                            mode: NumPadMode.basic,
                            onDigitTapped: { digit in
                                if tableNumberInput.count < 3 { tableNumberInput += digit }
                            },
                            onPrintTapped:  { handlePrint() },
                            onSearchTapped: { onTableButtonClicked(tableNumberInput) }
                        )
                        .scaleEffect(0.6)
                        .frame(
                            maxWidth:  geometry.size.width * 0.45,
                            maxHeight: geometry.size.height * 0.35
                        )
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.top, 20)
                    .padding(.horizontal, 16)

                    Spacer()

                    HStack {
                        CustomIconButton(systemName: "house.fill") { onHomeButtonClicked() }
                        Spacer()
                    }
                    .padding(.horizontal, 30)
                    .padding(.bottom, 16)
                }
                .frame(width: geometry.size.width, height: geometry.size.height * 0.5)
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
            .background(Color.white)
            .ignoresSafeArea()
            .overlay { if isLoading { CustomLoader() } }
        }
    }

    private func unavailableArticles() -> [String] {
        guard case .success(let data) = viewModel.uiState else { return [] }
        return data.articles.filter { !$0.available }.map { $0.name }
    }

    private func handlePrint() {
        isLoading = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) { isLoading = false }
    }
}

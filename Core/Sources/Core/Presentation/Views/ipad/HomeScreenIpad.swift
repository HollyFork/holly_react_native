import SwiftUI

public struct HomeScreenIpad: View {
    var onHomeButtonClicked: () -> Void
    var onTableButtonClicked: (String) -> Void

    @ObservedObject var viewModel: HomeViewModel
    @StateObject var reservationViewModel: ReservationViewModel
    @State private var showPaymentSheet: Bool = false

    @State private var tableNumberInput: String = ""
    @State private var isLoading: Bool = false
    @State private var showTableScreen: Bool = false
    @State private var selectedTable: String = ""

    @StateObject private var orderViewModel = TableOrderViewModel()

    public init(
        onHomeButtonClicked: @escaping () -> Void,
        onTableButtonClicked: @escaping (String) -> Void,
        viewModel: HomeViewModel
    ) {
        self.onHomeButtonClicked = onHomeButtonClicked
        self.onTableButtonClicked = onTableButtonClicked
        self.viewModel = viewModel
        _reservationViewModel = StateObject(wrappedValue: ReservationViewModel(
            createUseCase: DependencyContainer.shared.createReservationUseCase,
            updateUseCase: DependencyContainer.shared.updateReservationUseCase,
            deleteUseCase: DependencyContainer.shared.deleteReservationUseCase
        ))
    }

    public var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                HStack(spacing: 0) {

                    // ── Colonne gauche 70% ─────────────────────────
                    VStack(spacing: 0) {

                        HStack {
                            EmployeeTypeProfile(
                                employeeName: SessionManager.shared.employeeName ?? "Employé",
                                typeEmployee: SessionManager.shared.employeeType,
                                typeEmployeeIsVisible: false,
                                profileImage: Image(systemName: "person.fill")
                            )
                            Spacer()
                        }
                        .overlay(Rectangle().stroke(Color.black, lineWidth: 1))

                        if showTableScreen {
                            TableScreen(
                                tableNumber:    selectedTable,
                                articles:       viewModel.articlesByCategory,
                                orderViewModel: orderViewModel,
                                onBackToMap: {
                                    showTableScreen  = false
                                    tableNumberInput = ""
                                    orderViewModel.reset()
                                },
                                onPayTapped: { showPaymentSheet = true }
                            )
                            .frame(
                                width:  geometry.size.width * 0.7,
                                height: geometry.size.height * 0.8
                            )
                        } else {
                            Image("test_map_restaurant_ipad")
                                .resizable()
                                .scaledToFill()
                                .frame(
                                    width:  geometry.size.width * 0.7,
                                    height: geometry.size.height * 0.8
                                )
                                .clipped()
                        }

                        HStack {
                            CustomIconButton(systemName: "house.fill") {
                                showTableScreen  = false
                                tableNumberInput = ""
                                orderViewModel.reset()
                                onHomeButtonClicked()
                            }
                            Spacer()
                            if showTableScreen {
                                CustomIconButton(imageName: "ic_payment_check_point") {
                                    showPaymentSheet = true
                                }
                                CustomIconButton(systemName: "paperplane.fill") { }
                            }
                        }
                        .overlay(VStack {
                            Rectangle().fill(Color.black).frame(height: 1)
                            Spacer()
                        })
                    }
                    .frame(width: geometry.size.width * 0.7)

                    // ── Colonne droite 30% ──────────────────────────
                    VStack(spacing: 6) {

                        ReservationsSection(
                            viewModel: viewModel,
                            onAddReservation: {
                                guard case .success(let data) = viewModel.uiState else { return }
                                reservationViewModel.openCreate(salles: data.salles)
                            },
                            onEditReservation: { reservation in
                                guard case .success(let data) = viewModel.uiState else { return }
                                reservationViewModel.openEdit(reservation, salles: data.salles)
                            }
                        )
                        .frame(maxHeight: geometry.size.height * 0.50)

                        SearchTableSection(
                            tableNumberInput: $tableNumberInput,
                            onPrintTapped:   { handlePrint() },
                            onSearchTapped: {
                                if !tableNumberInput.isEmpty {
                                    selectedTable   = tableNumberInput
                                    showTableScreen = true
                                }
                            }
                        )
                        .frame(maxHeight: geometry.size.height * 0.50)

                    }
                    .frame(width: geometry.size.width * 0.3)
                }
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
            .padding(.top,    geometry.safeAreaInsets.top)
            .padding(.bottom, geometry.safeAreaInsets.bottom)
            .background(Color.white.ignoresSafeArea())
            .overlay { if isLoading { CustomLoader() } }
        }
        .sheet(isPresented: $reservationViewModel.showSheet) {
            ReservationFormSheet(
                viewModel: reservationViewModel,
                onDone: { Task { await viewModel.loadAll() } }
            )
        }
        .sheet(isPresented: $showPaymentSheet) {
            CustomPaymentBottomSheet(
                tableNumber: selectedTable,
                orderItems:  orderViewModel.allItems
            )
        }
    }

    // MARK: - Helpers

    private func unavailableArticles() -> [String] {
        guard case .success(let data) = viewModel.uiState else { return [] }
        return data.articles.filter { !$0.available }.map { $0.name }
    }

    private func formattedHour(_ date: Date) -> String {
        let f = DateFormatter(); f.dateFormat = "HH'h'mm"; return f.string(from: date)
    }

    private func formattedToday() -> String {
        let f = DateFormatter(); f.dateFormat = "dd/MM/yyyy"; return f.string(from: Date())
    }

    private func formattedTime() -> String {
        let f = DateFormatter(); f.dateFormat = "HH'h'mm"; return f.string(from: Date())
    }

    private func handlePrint() {
        isLoading = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) { isLoading = false }
    }
}


// MARK: - SearchTableSection

struct SearchTableSection: View {
    @Binding var tableNumberInput: String
    var onPrintTapped: () -> Void
    var onSearchTapped: () -> Void

    private let numPadNativeHeight: CGFloat = 320
    private let numPadNativeWidth: CGFloat  = 280
    private let titleHeight: CGFloat        = 60

    var body: some View {
        GeometryReader { geo in
            let availableHeight = geo.size.height - titleHeight
            let availableWidth  = geo.size.width
            let scaleByH = availableHeight / numPadNativeHeight
            let scaleByW = availableWidth  / numPadNativeWidth
            let scale    = min(scaleByH, scaleByW, 0.65)

            VStack(spacing: 0) {
                CustomTitlePanel(title: "Recherche de table")
                    .frame(height: titleHeight)

                Spacer(minLength: 0)

                CustomNumPad(
                    mode: .basic,
                    onDigitTapped: { digit in
                        if tableNumberInput.count < 3 { tableNumberInput += digit }
                    },
                    onPrintTapped: onPrintTapped,
                    onSearchTapped: onSearchTapped
                )
                // ✅ 1. Frame natif AVANT — SwiftUI rend le numpad à cette taille
                .frame(width: numPadNativeWidth, height: numPadNativeHeight)
                // ✅ 2. Scale visuel
                .scaleEffect(scale, anchor: .center)
                // ✅ 3. Frame réduit APRÈS — écrase le layout frame au vrai espace occupé
                .frame(width: numPadNativeWidth * scale, height: numPadNativeHeight * scale)

                Spacer(minLength: 0)
            }
            .frame(width: geo.size.width, height: geo.size.height)
        }
    }
}

// MARK: - ServicesInfoSection

struct ServicesInfoSection: View {
    var items: [String]
    private let titleHeight: CGFloat = 60

    var body: some View {
        GeometryReader { geo in
            VStack(spacing: 0) {
                CustomTitlePanel(title: "Infos de Services")
                    .frame(height: titleHeight)

                ServicesInformations(
                    showIcon: true,
                    title: "Rupture :",
                    items: items
                )
                .frame(width: geo.size.width, height: geo.size.height - titleHeight)
                .padding(.leading, 5)
                .clipped()
            }
            .frame(width: geo.size.width, height: geo.size.height)
        }
    }
}


// MARK: - ReservationsSection

struct ReservationsSection: View {
    @ObservedObject var viewModel: HomeViewModel
    var onAddReservation: () -> Void
    var onEditReservation: (Reservation) -> Void

    private let headerHeight: CGFloat  = 50
    private let dateBarHeight: CGFloat = 44

    var body: some View {
        GeometryReader { geo in
            VStack(spacing: 0) {

                CustomPanelWithAction(
                    title: "Réservations",
                    action: onAddReservation,
                    iconName: "desk_bell"
                )
                .frame(height: headerHeight)

                CustomDateTimeWeatherHeader(
                    date: formattedToday(),
                    time: formattedTime(),
                    showWeatherIcon: true
                )
                .frame(height: dateBarHeight)

                let listHeight = geo.size.height - headerHeight - dateBarHeight
                reservationsList
                    .frame(width: geo.size.width, height: max(listHeight, 0))
            }
            .frame(width: geo.size.width, height: geo.size.height)
        }
    }

    @ViewBuilder
    private var reservationsList: some View {
        switch viewModel.uiState {

        case .loading:
            ScrollView {
                LazyVGrid(columns: gridColumns, spacing: 10) {
                    ForEach(0..<6, id: \.self) { _ in
                        RoundedRectangle(cornerRadius: 16)
                            .fill(Color.gray.opacity(0.15))
                            .frame(height: 55)
                            .shimmer()
                    }
                }
                .padding(10)
            }

        case .success(let data):
            ScrollView {
                LazyVGrid(columns: gridColumns, spacing: 10) {
                    ForEach(data.reservations) { reservation in
                        CustomReservationCard(
                            hourReservation: formattedHour(reservation.datetime),
                            numberPersonReservation: reservation.partySize,
                            onTap: { onEditReservation(reservation) }
                        )
                    }
                }
                .padding(10)
            }

        case .error(let msg):
            Text(msg)
                .font(.caption)
                .foregroundColor(.red)
                .padding()
                .frame(maxWidth: .infinity, maxHeight: .infinity)

        default:
            EmptyView()
        }
    }

    private var gridColumns: [GridItem] {
        Array(repeating: GridItem(.flexible(), spacing: 8), count: 3)
    }

    private func formattedHour(_ date: Date) -> String {
        let f = DateFormatter(); f.dateFormat = "HH'h'mm"; return f.string(from: date)
    }

    private func formattedToday() -> String {
        let f = DateFormatter(); f.dateFormat = "dd/MM/yyyy"; return f.string(from: Date())
    }

    private func formattedTime() -> String {
        let f = DateFormatter(); f.dateFormat = "HH'h'mm"; return f.string(from: Date())
    }
}

import SwiftUI

public struct HomeScreenIpad: View {

    var onHomeButtonClicked:  () -> Void
    var onTableButtonClicked: (String) -> Void
    @ObservedObject var viewModel: HomeViewModel

    @StateObject private var reservationViewModel = ReservationViewModel()
    @StateObject private var tableSearchViewModel = TableSearchViewModel()
    @StateObject private var orderViewModel:       TableOrderViewModel

    @State private var showPaymentSheet: Bool    = false
    @State private var tableNumberInput: String  = ""
    @State private var isLoading:        Bool    = false
    @State private var showTableScreen:  Bool    = false
    @State private var selectedTable:    String  = ""
    @State private var currentTableId:   Int     = 0
    @State private var printMessage:     String? = nil

    @State private var isPrintMode: Bool = false
    
    @State private var showPrinterSheet: Bool = false
    @State private var selectedPrinter: String = "Cuisine"
    @State private var pendingPrintTableId: Int? = nil
    @State private var pendingCommandeId: Int? = nil

    public init(
        onHomeButtonClicked:  @escaping () -> Void,
        onTableButtonClicked: @escaping (String) -> Void,
        viewModel: HomeViewModel
    ) {
        self.onHomeButtonClicked  = onHomeButtonClicked
        self.onTableButtonClicked = onTableButtonClicked
        self.viewModel            = viewModel

        _orderViewModel = StateObject(
            wrappedValue: TableOrderViewModel(
                kitchenPrintUseCase: KitchenPrintUseCase(
                    repository: OrderRepositoryImpl(
                        dataSource: OrderRemoteDataSourceImpl(
                            networkClient: DependencyContainer.shared.networkClient
                        )
                    )
                )
            )
        )
    }

    public var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                HStack(spacing: 0) {

                    VStack(spacing: 0) {

                        HStack {
                            EmployeeTypeProfile(
                                employeeName:          SessionManager.shared.employeeName ?? "Employé",
                                typeEmployee:          SessionManager.shared.employeeType,
                                typeEmployeeIsVisible: false,
                                profileImage:          Image(systemName: "person.fill")
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
                                    currentTableId   = 0
                                    orderViewModel.reset()
                                },
                                onPayTapped: { showPaymentSheet = true }
                            )
                            .frame(
                                width:  geometry.size.width * 0.7,
                                height: geometry.size.height * 0.8
                            )
                        } else {
                            FloorPlanDemoView(tableSearchViewModel: tableSearchViewModel)
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
                                currentTableId   = 0
                                orderViewModel.reset()
                                onHomeButtonClicked()
                            }

                            Spacer()

                            if showTableScreen {
                                CustomPrimaryButton(
                                    title: "Revenir sur le plan du restaurant",
                                    action: { showTableScreen = false },
                                    isActive: true
                                )

                                CustomIconButton(imageName: "ic_payment_check_point") {
                                    showPaymentSheet = true
                                }

                                CustomIconButton(systemName: "paperplane.fill") {
                                    Task {
                                        isLoading = true
                                        await orderViewModel.sendOrder(
                                            tableId:      currentTableId,
                                            restaurantId: SessionManager.shared.restaurantId ?? 0
                                        )
                                        isLoading = false
                                    }
                                }
                                .disabled(orderViewModel.allItems.isEmpty)
                            }
                        }
                        .overlay(VStack { Rectangle().fill(Color.black).frame(height: 1); Spacer() })
                    }
                    .frame(width: geometry.size.width * 0.7)

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
                            onPrintTapped: {

                                let numeroStr = showTableScreen ? selectedTable : tableNumberInput

                                guard !numeroStr.isEmpty, let _ = Int(numeroStr) else {
                                    printMessage = "Entrez un numéro de table"
                                    return
                                }
                                // Synchronise le champ pour que handlePrint() puisse l'utiliser
                                tableNumberInput = numeroStr
                                isPrintMode = true
                                showPrinterSheet = true
                            },
                            onSearchTapped: {
                                guard !tableNumberInput.isEmpty,
                                      let id = Int(tableNumberInput) else { return }
                                isPrintMode = false
                                Task { await tableSearchViewModel.searchTable(numero: id) }
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
            .overlay {
                if isLoading { CustomLoader() }
                if let message = printMessage {
                    Text(message)
                        .font(.caption)
                        .padding()
                        .background(Color.gray.opacity(0.2))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                        .onAppear {
                            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                printMessage = nil
                            }
                        }
                }
            }
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
        .sheet(isPresented: $showPrinterSheet) {
            PrinterSelectionSheet(
                selectedPrinter: $selectedPrinter,
                onConfirm: {
                    handlePrint()
                }
            )
        }
        .onChange(of: tableSearchViewModel.uiState) { state in
            switch state {

            case .found(let detail):
                if isPrintMode {
                    isPrintMode = false
                    tableSearchViewModel.reset()
                    tableNumberInput = ""

                    guard let commandeId = detail.existingCommandeId else {
                        printMessage = "Aucune commande en cours pour T\(detail.numero)"
                        return
                    }
                    Task {
                        isLoading = true
                        await orderViewModel.printOrder(commandeId: commandeId)
                        printMessage = "🖨️ Ticket imprimé — T\(detail.numero)"
                        isLoading = false
                    }

                } else {
                    currentTableId   = detail.id
                    selectedTable    = String(detail.numero)
                    tableNumberInput = ""
                    showTableScreen  = true

                    if let commandeId = detail.existingCommandeId {
                        orderViewModel.commandeId  = commandeId
                        orderViewModel.directItems = detail.existingOrderItems.map { line in
                            OrderItem(
                                article: Article(
                                    id:           line.articleId,
                                    name:         line.articleName,
                                    price:        line.unitPrice,
                                    description:  nil,
                                    available:    true,
                                    categoryId:   0,
                                    categoryName: ""
                                ),
                                quantity: line.quantity
                            )
                        }
                        orderViewModel.suivre1Items = []
                        orderViewModel.suivre2Items = []
                        print("♻️ Commande \(commandeId) restaurée — T\(detail.numero) — \(detail.existingOrderItems.count) lignes")
                    } else {
                        orderViewModel.reset()
                    }
                    tableSearchViewModel.reset()
                }

            case .error(let msg):
                isPrintMode = false
                print("❌ Table: \(msg)")

            default:
                break
            }
        }
        .onChange(of: orderViewModel.orderUiState) { state in
            if case .success(let commandeId) = state {
                print("✅ Commande \(commandeId) confirmée")

                showTableScreen  = false
                tableNumberInput = ""
                currentTableId   = 0

                let idToPrint = commandeId
                orderViewModel.reset()

                Task {
                    try? await Task.sleep(nanoseconds: 500_000_000)
                    await orderViewModel.printOrder(commandeId: idToPrint)
                }
            }
        }
    }

    private func handlePrint() {
        guard !tableNumberInput.isEmpty, let numero = Int(tableNumberInput) else {
            printMessage = "Numéro de table invalide"
            isPrintMode = false
            return
        }
        Task { await tableSearchViewModel.searchTable(numero: numero) }
    }
}


struct SearchTableSection: View {
    @Binding var tableNumberInput: String
    var onPrintTapped:  () -> Void
    var onSearchTapped: () -> Void

    private let numPadNativeHeight: CGFloat = 320
    private let numPadNativeWidth:  CGFloat = 280
    private let titleHeight:        CGFloat = 60

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
                        if tableNumberInput.count < 4 { tableNumberInput += digit }
                    },
                    onPrintTapped:  onPrintTapped,
                    onSearchTapped: onSearchTapped
                )
                .frame(width: numPadNativeWidth, height: numPadNativeHeight)
                .scaleEffect(scale, anchor: .center)
                .frame(width: numPadNativeWidth * scale, height: numPadNativeHeight * scale)

                Spacer(minLength: 0)
            }
            .frame(width: geo.size.width, height: geo.size.height)
        }
    }
}


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
                    title:    "Rupture :",
                    items:    items
                )
                .frame(width: geo.size.width, height: geo.size.height - titleHeight)
                .padding(.leading, 5)
                .clipped()
            }
            .frame(width: geo.size.width, height: geo.size.height)
        }
    }
}


struct ReservationsSection: View {
    @ObservedObject var viewModel: HomeViewModel
    var onAddReservation:  () -> Void
    var onEditReservation: (Reservation) -> Void

    private let headerHeight:  CGFloat = 50
    private let dateBarHeight: CGFloat = 44

    var body: some View {
        GeometryReader { geo in
            VStack(spacing: 0) {
                CustomPanelWithAction(
                    title:    "Réservations",
                    action:   onAddReservation,
                    iconName: "desk_bell"
                )
                .frame(height: headerHeight)
                .zIndex(1)

                CustomDateTimeWeatherHeader(
                    date:            formattedToday(),
                    time:            formattedTime(),
                    showWeatherIcon: true
                )
                .frame(height: dateBarHeight)
                .zIndex(1)

                let listHeight = geo.size.height - headerHeight - dateBarHeight
                reservationsList
                    .frame(width: geo.size.width, height: max(listHeight, 0))
                    .clipped()
            }
            .frame(width: geo.size.width, height: geo.size.height)
            .clipped()
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
            .clipped()

        case .success(let data):
            ScrollView {
                LazyVGrid(columns: gridColumns, spacing: 10) {
                    ForEach(data.reservations) { reservation in
                        CustomReservationCard(
                            hourReservation:         formattedHour(reservation.datetime),
                            numberPersonReservation: reservation.partySize,
                            onTap: { onEditReservation(reservation) }
                        )
                    }
                }
                .padding(10)
            }
            .clipped()

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

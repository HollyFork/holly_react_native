import SwiftUI

public struct HomeScreenIphone: View {
    var onHomeButtonClicked: () -> Void
    var onTableButtonClicked: (String) -> Void
    @ObservedObject var viewModel: HomeViewModel

    @StateObject private var reservationViewModel = ReservationViewModel()
    @StateObject private var tableSearchViewModel = TableSearchViewModel()
    @StateObject private var orderViewModel: TableOrderViewModel

    @State private var showPaymentSheet: Bool = false
    @State private var tableNumberInput: String = ""
    @State private var isLoading: Bool = false
    @State private var showTableScreen: Bool = false
    @State private var selectedTable: String = ""
    @State private var currentTableId: Int = 0
    @State private var printMessage: String? = nil
    @State private var isPrintMode: Bool = false

    @State private var showPrinterSheet: Bool = false
    @State private var selectedPrinter: String = "Cuisine"
    @State private var pendingPrintTableId: Int? = nil
    @State private var pendingCommandeId: Int? = nil
    
    public init(
        onHomeButtonClicked: @escaping () -> Void,
        onTableButtonClicked: @escaping (String) -> Void,
        viewModel: HomeViewModel
    ) {
        self.onHomeButtonClicked = onHomeButtonClicked
        self.onTableButtonClicked = onTableButtonClicked
        self.viewModel = viewModel

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
        VStack(spacing: 0) {
            Group {
                if showTableScreen {
                    TableScreen(
                        tableNumber: selectedTable,
                        articles: viewModel.articlesByCategory,
                        orderViewModel: orderViewModel,
                        onBackToMap: {
                            showTableScreen = false
                            tableNumberInput = ""
                            currentTableId = 0
                            orderViewModel.reset()
                        },
                        onPayTapped: { showPaymentSheet = true }
                    )
                    .padding(.top, 20)
                } else {
                    FloorPlanDemoView(tableSearchViewModel: tableSearchViewModel)
                        .padding(.top, 10)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            VStack(spacing: 0) {
                HStack(alignment: .top, spacing: 0) {
                    ServicesInformations(
                        showIcon: true,
                        title: "Rupture :",
                        items: unavailableArticles()
                    )
                    .scaleEffect(0.75, anchor: .topLeading)
                    .frame(width: 160, height: 220, alignment: .topLeading)
                    .clipped()

                    Spacer()

                    GeometryReader { geo in
                        CustomNumPad(
                            mode: .basic,
                            onDigitTapped: { digit in
                                if tableNumberInput.count < 4 { tableNumberInput += digit }
                            },
                            onPrintTapped: {
                                guard !tableNumberInput.isEmpty, let _ = Int(tableNumberInput) else {
                                    printMessage = "Entrez un numéro de table"
                                    return
                                }
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
                        .scaleEffect(0.55, anchor: .topLeading)
                        .frame(width: geo.size.width, height: geo.size.height, alignment: .topLeading)
                        .clipped()
                    }
                    .frame(width: 200, height: 240)
                }
                .padding(.top, 12)
                .padding(.horizontal, 16)

                HStack {
                    CustomIconButton(systemName: "house.fill") {
                        showTableScreen = false
                        tableNumberInput = ""
                        currentTableId = 0
                        orderViewModel.reset()
                        onHomeButtonClicked()
                    }
                    .scaleEffect(0.7)

                    Spacer()

                    if showTableScreen {
                        CustomIconButton(imageName: "ic_payment_check_point") {
                            showPaymentSheet = true
                        }
                        .scaleEffect(0.7)

                        CustomIconButton(systemName: "paperplane.fill") {
                            Task {
                                isLoading = true
                                await orderViewModel.sendOrder(
                                    tableId: currentTableId,
                                    restaurantId: SessionManager.shared.restaurantId ?? 0
                                )
                                
                                isLoading = false
                            }
                        }
                        .scaleEffect(0.7)
                        .disabled(orderViewModel.allItems.isEmpty)
                    }
                }
                .frame(height: 44)
                .padding(.horizontal, 30)
                .padding(.vertical, 6)
            }
            .frame(maxWidth: .infinity)
            .background(Color.white)
        }
        .padding(.top, 8)
        .ignoresSafeArea(edges: .bottom)
        .background(Color.white)
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
        .sheet(isPresented: $reservationViewModel.showSheet) {
            ReservationFormSheet(
                viewModel: reservationViewModel,
                onDone: { Task { await viewModel.loadAll() } }
            )
        }
        .sheet(isPresented: $showPaymentSheet) {
            CustomPaymentBottomSheet(
                tableNumber: selectedTable,
                orderItems: orderViewModel.allItems
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
                    currentTableId = detail.id
                    selectedTable = String(detail.numero)
                    tableNumberInput = ""
                    showTableScreen = true

                    if let commandeId = detail.existingCommandeId {
                        orderViewModel.commandeId = commandeId
                        orderViewModel.directItems = detail.existingOrderItems.map { line in
                            OrderItem(
                                article: Article(
                                    id: line.articleId,
                                    name: line.articleName,
                                    price: line.unitPrice,
                                    description: nil,
                                    available: true,
                                    categoryId: 0,
                                    categoryName: ""
                                ),
                                quantity: line.quantity
                            )
                        }
                        orderViewModel.suivre1Items = []
                        orderViewModel.suivre2Items = []
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

    private func unavailableArticles() -> [String] {
        guard case .success(let data) = viewModel.uiState else { return [] }
        return data.articles.filter { !$0.available }.map { $0.name }
    }

    private func handlePrint() {
        guard !tableNumberInput.isEmpty, let numero = Int(tableNumberInput) else {
            printMessage = "Numéro invalide"
            isPrintMode = false
            return
        }
        Task { await tableSearchViewModel.searchTable(numero: numero) }
    }
}

import Foundation
import Combine

public struct OrderItem: Identifiable, Equatable {
    public let id:      UUID = UUID()
    public let article: Article
    public var quantity: Int

    public init(article: Article, quantity: Int) {
        self.article  = article
        self.quantity = quantity
    }

    public var unitPrice: Double {
        let cleaned = article.price
            .replacingOccurrences(of: ",", with: ".")
            .trimmingCharacters(in: CharacterSet(charactersIn: "."))
        return Double(cleaned) ?? 0
    }

    public var totalPrice: Double { unitPrice * Double(quantity) }
    public var formattedUnitPrice: String  { String(format: "%.2f€", unitPrice) }
    public var formattedTotalPrice: String { String(format: "%.2f€", totalPrice) }
}

@MainActor
public final class TableOrderViewModel: ObservableObject {

    @Published public var directItems:   [OrderItem] = []
    @Published public var suivre1Items:  [OrderItem] = []
    @Published public var suivre2Items:  [OrderItem] = []
    @Published public var orderUiState:  OrderUiState = .idle

    public var commandeId: Int? = nil

    private let sendOrderUseCase: SendOrderUseCase
    private let kitchenPrintUseCase: KitchenPrintUseCase?

    
    public init(kitchenPrintUseCase: KitchenPrintUseCase? = nil) {
        let ds        = OrderRemoteDataSourceImpl(networkClient: DependencyContainer.shared.networkClient)
        let repo      = OrderRepositoryImpl(dataSource: ds)
        let createUC  = CreateOrderUseCase(repository: repo)
        let addLineUC = AddOrderLineUseCase(repository: repo)
        self.sendOrderUseCase = SendOrderUseCase(
            createOrderUseCase:  createUC,
            addOrderLineUseCase: addLineUC
        )
        self.kitchenPrintUseCase = kitchenPrintUseCase
    }

    public var allItems: [OrderItem]  { directItems + suivre1Items + suivre2Items }
    public var grandTotal: Double     { allItems.reduce(0) { $0 + $1.totalPrice } }

    public func addArticle(_ article: Article, to section: TableScreen.SectionTarget) {
        switch section {
        case .direct:  addTo(list: &directItems,  article: article)
        case .suivre1: addTo(list: &suivre1Items, article: article)
        case .suivre2: addTo(list: &suivre2Items, article: article)
        }
    }

    private func addTo(list: inout [OrderItem], article: Article) {
        if let index = list.firstIndex(where: { $0.article.id == article.id }) {
            list[index].quantity += 1
        } else {
            list.append(OrderItem(article: article, quantity: 1))
        }
    }

    public func sendOrder(
        tableId: Int,
        restaurantId: Int,
        kitchenPrintUseCase: KitchenPrintUseCase? = nil  
    ) async {
        guard !allItems.isEmpty else {
            orderUiState = .error("Aucun article à envoyer")
            return
        }
        
        orderUiState = .loading
        let createdById = SessionManager.shared.employeeId ?? 0

        do {
            let finalId = try await sendOrderUseCase.execute(
                existingCommandeId: commandeId,
                tableId:            tableId,
                restaurantId:       restaurantId,
                createdById:        createdById,
                items:              allItems
            )
            commandeId   = finalId
            orderUiState = .success(commandeId: finalId)
           
            print("✅ Commande \(finalId) envoyée — \(allItems.count) lignes")

            

        } catch let error as AuthError {
            orderUiState = .error(error.errorDescription ?? "Erreur")
        } catch {
            orderUiState = .error(error.localizedDescription)
        }
    }

    public func printOrder(commandeId: Int) async {
        guard let printUC = kitchenPrintUseCase else {
            print("⚠️ KitchenPrintUseCase non configuré")
            return
        }
        do {
            try await printUC.execute(commandeId: commandeId)
            print("🖨️ Impression cuisine OK pour commande \(commandeId)")
        } catch {
            print("⚠️ Échec impression cuisine pour commande \(commandeId) — \(error.localizedDescription)")
        }
    }
    
    
    public func reset() {
        directItems  = []
        suivre1Items = []
        suivre2Items = []
        commandeId   = nil
        orderUiState = .idle
    }
}



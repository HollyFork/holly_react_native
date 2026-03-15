//
//  TableOrderViewModel.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Foundation
import Combine
import Foundation

public struct OrderItem: Identifiable, Equatable {

    public let id:      UUID    = UUID()
    public let article: Article
    public var quantity: Int

    public init(article: Article, quantity: Int) {
        self.article  = article
        self.quantity = quantity
    }

    // ✅ Prix unitaire nettoyé (gère "5.97", "5,97", "5.")
    public var unitPrice: Double {
        let cleaned = article.price
            .replacingOccurrences(of: ",", with: ".")
            .trimmingCharacters(in: CharacterSet(charactersIn: "."))
        return Double(cleaned) ?? 0
    }

    // ✅ Prix total = unitaire × quantité
    public var totalPrice: Double {
        unitPrice * Double(quantity)
    }

    // ✅ Affichage formaté
    public var formattedUnitPrice: String {
        String(format: "%.2f€", unitPrice)
    }

    public var formattedTotalPrice: String {
        String(format: "%.2f€", totalPrice)
    }
}

@MainActor
public final class TableOrderViewModel: ObservableObject {

    @Published public var directItems:  [OrderItem] = []
    @Published public var suivre1Items: [OrderItem] = []
    @Published public var suivre2Items: [OrderItem] = []

    public init() {}
    
    public var allItems: [OrderItem] {
        directItems + suivre1Items + suivre2Items
    }

    public var grandTotal: Double {
        allItems.reduce(0) { $0 + $1.totalPrice }
    }

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
        print("🛒 Total: \(allItems.count) articles — \(String(format: "%.2f", grandTotal))€")
    }

    public func reset() {
        directItems  = []
        suivre1Items = []
        suivre2Items = []
    }
}

import SwiftUI
import Foundation
import Combine

// MARK: - TableScreen

public struct TableScreen: View {

    let tableNumber:        String
    let articlesByCategory: [HomeViewModel.CategoryWithArticles]
    var onBackToMap:        () -> Void
    var onPayTapped:        () -> Void

    @ObservedObject var orderViewModel: TableOrderViewModel
    @State private var selectedCategory: HomeViewModel.CategoryWithArticles? = nil
    @State private var activeSection: SectionTarget = .direct

    public enum SectionTarget: String, CaseIterable {
        case direct  = "Direct"
        case suivre1 = "À Suivre 1"
        case suivre2 = "À Suivre 2"
    }

    public init(
        tableNumber:    String,
        articles:       [HomeViewModel.CategoryWithArticles] = [],
        orderViewModel: TableOrderViewModel,
        onBackToMap:    @escaping () -> Void = {},
        onPayTapped:    @escaping () -> Void = {}
    ) {
        self.tableNumber        = tableNumber
        self.articlesByCategory = articles
        self.orderViewModel     = orderViewModel
        self.onBackToMap        = onBackToMap
        self.onPayTapped        = onPayTapped
    }

    public var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {

                // ── Header ──────────────────────────────────────
                HStack {
                    Image(systemName: "clock").foregroundColor(.black)
                    Text("01:14:54").font(.system(size: 16)).foregroundColor(.black)
                    Spacer()
                    Text("T \(tableNumber)").font(.system(size: 20, weight: .bold))
                    Spacer()
                    Image(systemName: "person.2.fill").foregroundColor(.black)
                    Text("3 pax").font(.system(size: 16)).foregroundColor(.black)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.white)
                .overlay(Rectangle().stroke(Color.black, lineWidth: 1))

                HStack(spacing: 0) {

                    // ── Colonne gauche — commande ────────────────
                    VStack(spacing: 0) {

                        // Tabs
                        HStack(spacing: 0) {
                            ForEach(SectionTarget.allCases, id: \.self) { section in
                                Button { activeSection = section } label: {
                                    Text(section.rawValue)
                                        .font(.system(size: 11, weight: .semibold))
                                        .foregroundColor(activeSection == section ? .white : .black)
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 6)
                                        .background(activeSection == section
                                            ? Color(red: 0.2, green: 0.3, blue: 0.35)
                                            : Color.gray.opacity(0.15))
                                }
                                .overlay(Rectangle().stroke(Color.black, lineWidth: 0.5))
                            }
                        }

                        // Les 3 sections — chacune a son propre ScrollView
                        GeometryReader { leftGeo in
                            VStack(spacing: 0) {
                                OrderSectionView(
                                    title:    "Direct",
                                    items:    $orderViewModel.directItems,
                                    isActive: activeSection == .direct,
                                    height:   leftGeo.size.height / 3
                                )
                                OrderSectionView(
                                    title:    "À Suivre 1",
                                    items:    $orderViewModel.suivre1Items,
                                    isActive: activeSection == .suivre1,
                                    height:   leftGeo.size.height / 3
                                )
                                OrderSectionView(
                                    title:    "À Suivre 2",
                                    items:    $orderViewModel.suivre2Items,
                                    isActive: activeSection == .suivre2,
                                    height:   leftGeo.size.height / 3
                                )
                            }
                        }
                    }
                    .frame(width: geometry.size.width * 0.33)
                    .background(Color.white)
                    .overlay(Rectangle().stroke(Color.black, lineWidth: 1))

                    Rectangle().fill(Color.black).frame(width: 1)

                    // ── Colonne centre — articles ────────────────
                    VStack {
                        if let selected = selectedCategory {
                            Text(selected.category.name)
                                .font(.system(size: 18, weight: .bold))
                                .padding(.top, 8)

                            ScrollView {
                                LazyVGrid(
                                    columns: [GridItem(.adaptive(minimum: 120), spacing: 8)],
                                    spacing: 8
                                ) {
                                    ForEach(selected.articles) { article in
                                        Button {
                                            orderViewModel.addArticle(article, to: activeSection)
                                        } label: {
                                            VStack(spacing: 4) {
                                                Text(article.name)
                                                    .font(.system(size: 14, weight: .semibold))
                                                    .multilineTextAlignment(.center)
                                                    .foregroundColor(Color(red: 0.1, green: 0.4, blue: 0.7))
                                                Text(formattedPrice(article.price))
                                                    .font(.system(size: 12))
                                                    .foregroundColor(.gray)
                                            }
                                            .frame(maxWidth: .infinity, minHeight: 50)
                                            .padding(8)
                                            .background(Color.white)
                                            .cornerRadius(4)
                                            .overlay(
                                                RoundedRectangle(cornerRadius: 4)
                                                    .stroke(Color.gray.opacity(0.4), lineWidth: 1)
                                            )
                                        }
                                        .buttonStyle(PlainButtonStyle())
                                    }
                                }
                                .padding()
                            }
                        } else {
                            Spacer()
                            Text("Sélectionner une catégorie")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.gray)
                            Spacer()
                        }
                    }
                    .frame(width: geometry.size.width * 0.34)
                    .background(Color.white)
                    .overlay(Rectangle().stroke(Color.black, lineWidth: 1))

                    Rectangle().fill(Color.black).frame(width: 1)

                    // ── Colonne droite — menu catégories ─────────
                    VStack(spacing: 0) {
                        Text("Menu")
                            .font(.system(size: 22, weight: .bold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(Color.black)
                            .foregroundColor(.white)

                        ScrollView {
                            VStack(spacing: 0) {
                                ForEach(articlesByCategory) { item in
                                    CustomMenuCategoryButton(
                                        title:    item.category.name,
                                        bgColor:  categoryColor(for: item.category.id),
                                        txtColor: .white
                                    ) {
                                        selectedCategory = item
                                    }
                                }
                            }
                        }
                    }
                    .frame(width: geometry.size.width * 0.33)
                    .background(Color.white)
                    .overlay(Rectangle().stroke(Color.black, lineWidth: 1))
                }
            }
        }
        .background(Color.white)
    }

    private func formattedPrice(_ raw: String) -> String {
        let cleaned = raw.replacingOccurrences(of: ",", with: ".")
        guard let value = Double(cleaned) else { return "\(raw)€" }
        return String(format: "%.2f€", value)
    }

    private func categoryColor(for id: Int) -> Color {
        let palette: [Color] = [
            Color(red: 0.2, green: 0.3, blue: 0.35),
            .orange, .green, .purple, .cyan,
            Color(red: 0.6, green: 0.3, blue: 0.1),
            Color(red: 0.8, green: 0.3, blue: 0.8),
            Color(red: 1.0, green: 0.4, blue: 0.4),
        ]
        return palette[id % palette.count]
    }
}

// MARK: - OrderSectionView

struct OrderSectionView: View {
    let title:    String
    @Binding var items: [OrderItem]
    let isActive: Bool
    let height:   CGFloat

    private let headerHeight: CGFloat = 36

    var body: some View {
        VStack(spacing: 0) {

            // Titre
            Text(title)
                .font(.system(size: 14, weight: .semibold))
                .frame(maxWidth: .infinity)
                .frame(height: headerHeight)
                .background(isActive
                    ? Color(red: 0.2, green: 0.3, blue: 0.35).opacity(0.15)
                    : Color.gray.opacity(0.2))
                .overlay(Rectangle().stroke(Color.black, lineWidth: 1))

            // Liste — ScrollView propre à cette section
            ScrollView(.vertical, showsIndicators: false) {
                VStack(spacing: 0) {
                    if items.isEmpty {
                        Rectangle()
                            .fill(Color.white)
                            .frame(height: 44)
                    } else {
                        ForEach($items) { $item in
                            OrderItemRow(item: $item) {
                                items.removeAll { $0.id == item.id }
                            }
                        }
                    }
                }
            }
            .frame(height: max(0, height - headerHeight))
            .overlay(Rectangle().stroke(Color.black, lineWidth: 1))
        }
        .frame(height: height)
    }
}

// MARK: - OrderItemRow

struct OrderItemRow: View {
    @Binding var item: OrderItem
    var onDelete: () -> Void

    private let cardColor   = Color(red: 0.2, green: 0.3, blue: 0.35)
    private let deleteColor = Color.red

    @State private var offset:        CGFloat        = 0
    @State private var dragDirection: DragDirection? = nil

    private enum DragDirection { case horizontal, vertical }

    private let revealWidth:     CGFloat = 70
    private let snapThreshold:   CGFloat = -50
    private let deleteThreshold: CGFloat = -140

    var body: some View {
        ZStack(alignment: .trailing) {

            // Fond rouge (poubelle)
            if offset < 0 {
                Button { deleteWithAnimation() } label: {
                    Image(systemName: "trash.fill")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(width: min(-offset, revealWidth))
                        .frame(maxHeight: .infinity)
                        .background(deleteColor)
                }
                .buttonStyle(PlainButtonStyle())
            }

            // Ligne principale
            HStack(spacing: 0) {

                // Bouton X
                Button { deleteWithAnimation() } label: {
                    Text("X")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.red)
                        .frame(width: 18)
                }
                .buttonStyle(PlainButtonStyle())

                // Nom article
                Text(item.article.name)
                    .font(.system(size: 12, weight: .medium))
                    .lineLimit(1)
                    .truncationMode(.tail)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.leading, 4)

                // − quantité +
                HStack(spacing: 2) {
                    Button {
                        if item.quantity > 1 { item.quantity -= 1 }
                        else { deleteWithAnimation() }
                    } label: {
                        Image(systemName: "minus.circle")
                            .font(.system(size: 16))
                            .foregroundColor(cardColor)
                    }
                    .buttonStyle(PlainButtonStyle())

                    Text("\(item.quantity)")
                        .font(.system(size: 13, weight: .semibold))
                        .frame(width: 20, alignment: .center)
                        .monospacedDigit()

                    Button {
                        item.quantity += 1
                        snapBack()
                    } label: {
                        Image(systemName: "plus.circle")
                            .font(.system(size: 16))
                            .foregroundColor(cardColor)
                    }
                    .buttonStyle(PlainButtonStyle())
                }

                // Prix
                Text(item.formattedTotalPrice)
                    .font(.system(size: 12, weight: .semibold))
                    .monospacedDigit()
                    .frame(width: 52, alignment: .trailing)
                    .padding(.leading, 4)
            }
            .padding(.horizontal, 6)
            .padding(.vertical, 5)
            .background(Color.white)
            .contentShape(Rectangle())
            .offset(x: offset)
            // ✅ simultaneousGesture = coexiste avec le ScrollView parent
            .simultaneousGesture(
                DragGesture(minimumDistance: 10, coordinateSpace: .local)
                    .onChanged { value in
                        // 1. Détecte la direction au tout premier mouvement
                        if dragDirection == nil {
                            let h = abs(value.translation.width)
                            let v = abs(value.translation.height)
                            dragDirection = h > v ? .horizontal : .vertical
                        }

                        // 2. Si vertical → le ScrollView gère, on ne fait rien
                        guard dragDirection == .horizontal       else { return }
                        guard value.translation.width < 0        else { return }

                        let raw = value.translation.width
                        let clamped = raw > -revealWidth
                            ? raw
                            : -revealWidth + (raw + revealWidth) * 0.25
                        offset = clamped
                    }
                    .onEnded { value in
                        defer { dragDirection = nil } // reset après chaque geste

                        guard dragDirection == .horizontal else { return }

                        let velocity    = value.predictedEndTranslation.width
                        let translation = value.translation.width

                        if velocity < -500 || translation < deleteThreshold {
                            deleteWithAnimation()
                        } else if translation < snapThreshold {
                            withAnimation(.interactiveSpring(response: 0.25, dampingFraction: 0.85)) {
                                offset = -revealWidth
                            }
                        } else {
                            snapBack()
                        }
                    }
            )
            .animation(.interactiveSpring(response: 0.25, dampingFraction: 0.9), value: offset)
        }
        .frame(height: 34)
        .clipped()
        .overlay(Rectangle().stroke(Color.black.opacity(0.08), lineWidth: 0.5))
    }

    private func snapBack() {
        withAnimation(.interactiveSpring(response: 0.25, dampingFraction: 0.85)) {
            offset = 0
        }
    }

    private func deleteWithAnimation() {
        withAnimation(.easeInOut(duration: 0.2)) {
            offset = -UIScreen.main.bounds.width
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            onDelete()
        }
    }
}


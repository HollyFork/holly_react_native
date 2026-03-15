//
//  HomeViewModel.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Foundation
import Combine

@MainActor
public final class HomeViewModel: ObservableObject {

    @Published public var uiState: HomeUiState = .idle

    private let getSallesUseCase:       GetSallesUseCase
    private let getTablesUseCase:       GetTablesUseCase
    private let getCommandesUseCase:    GetCommandesUseCase
    private let getReservationsUseCase: GetReservationsUseCase
    private let getArticlesUseCase:     GetArticlesUseCase
    private let getCategoriesUseCase:   GetCategoriesUseCase

    private var cancellables = Set<AnyCancellable>()
    private let restaurantId: Int

    public init(
        getSallesUseCase:       GetSallesUseCase,
        getTablesUseCase:       GetTablesUseCase,
        getCommandesUseCase:    GetCommandesUseCase,
        getReservationsUseCase: GetReservationsUseCase,
        getArticlesUseCase:     GetArticlesUseCase,
        getCategoriesUseCase:   GetCategoriesUseCase,
        restaurantId: Int
    ) {
        self.getSallesUseCase       = getSallesUseCase
        self.getTablesUseCase       = getTablesUseCase
        self.getCommandesUseCase    = getCommandesUseCase
        self.getReservationsUseCase = getReservationsUseCase
        self.getArticlesUseCase     = getArticlesUseCase
        self.getCategoriesUseCase   = getCategoriesUseCase
        self.restaurantId           = restaurantId
    }

    // MARK: - Load (stratégie parallèle + séquentielle)
    public func loadAll() async {
        uiState = .loading

        // ── Groupe 1 : parallèle immédiat ─────────────────────
        let articlesP    = getArticlesUseCase.execute(disponible: true)
        let categoriesP  = getCategoriesUseCase.execute(restaurantId: restaurantId)
        let sallesP      = getSallesUseCase.execute(restaurantId: restaurantId)

        // ── Salles → Tables (séquentiel) + Commandes + Résa (parallèle après tables) ──
        sallesP
            .flatMap { [weak self] salles -> AnyPublisher<([Salle], [Table], [Commande], [Reservation]), AuthError> in
                guard let self else {
                    return Fail(error: AuthError.unknown).eraseToAnyPublisher()
                }
                // Tables depuis toutes les salles (tous salleId ou nil pour tout)
                let tablesP      = self.getTablesUseCase.execute(salleId: nil)
                let commandesP   = self.getCommandesUseCase.execute(restaurantId: self.restaurantId)
                let reservationsP = self.getReservationsUseCase.execute(restaurantId: self.restaurantId)

                // Parallèle : Tables + Commandes + Réservations
                return Publishers.Zip3(tablesP, commandesP, reservationsP)
                    .map { tables, commandes, reservations in
                        (salles, tables, commandes, reservations)
                    }
                    .eraseToAnyPublisher()
            }
            // Combine avec Articles + Catégories en parallèle
            .combineLatest(articlesP, categoriesP)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.uiState = .error(error.errorDescription ?? "Erreur inconnue")
                    }
                },
                receiveValue: { [weak self] combined, articles, categories in
                    let (salles, tables, commandes, reservations) = combined
                    self?.uiState = .success(HomeData(
                        salles:       salles,
                        tables:       tables,
                        commandes:    commandes,
                        reservations: reservations,
                        articles:     articles,
                        categories:   categories
                    ))
                }
            )
            .store(in: &cancellables)
    }

    public func refresh() async { await loadAll() }
    
    public var articlesByCategory: [CategoryWithArticles] {
        guard case .success(let data) = uiState else { return [] }

        let sorted = data.categories.sorted {
            $0.displayOrder != $1.displayOrder
                ? $0.displayOrder < $1.displayOrder
                : $0.name < $1.name
        }

        return sorted.compactMap { category in
            let articles = data.articles.filter { $0.categoryId == category.id }
            guard !articles.isEmpty else { return nil }
            return CategoryWithArticles(category: category, articles: articles)
        }
    }

    public struct CategoryWithArticles: Identifiable {
        public let id:       Int    // = category.id
        public let category: Category
        public let articles: [Article]

        init(category: Category, articles: [Article]) {
            self.id       = category.id
            self.category = category
            self.articles = articles
        }
    }
}

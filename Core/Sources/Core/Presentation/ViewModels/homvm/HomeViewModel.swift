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

    public init() {
        let networkClient = DependencyContainer.shared.networkClient
        let homeDS        = HomeDataSourceImpl(networkClient: networkClient)
        let tableDS       = TableActionDataSourceImpl(networkClient: networkClient) // ← NOUVEAU

        self.restaurantId = SessionManager.shared.restaurantId ?? 0

        self.getSallesUseCase = GetSallesUseCase(
            repository: SalleRepositoryImpl(dataSource: homeDS)
        )
        self.getTablesUseCase = GetTablesUseCase(
            repository: TableRepositoryImpl(          // ← les deux datasources
                homeDataSource:  homeDS,
                tableDataSource: tableDS
            )
        )
        self.getCommandesUseCase = GetCommandesUseCase(
            repository: CommandeRepositoryImpl(dataSource: homeDS)
        )
        self.getReservationsUseCase = GetReservationsUseCase(
            repository: ReservationRepositoryImpl(dataSource: homeDS)
        )
        self.getArticlesUseCase = GetArticlesUseCase(
            repository: ArticleRepositoryImpl(dataSource: homeDS)
        )
        self.getCategoriesUseCase = GetCategoriesUseCase(
            repository: CategoryRepositoryImpl(dataSource: homeDS)
        )
    }

    // MARK: - Load
    public func loadAll() async {
        uiState = .loading

        let articlesP   = getArticlesUseCase.execute(disponible: true)
        let categoriesP = getCategoriesUseCase.execute(restaurantId: restaurantId)
        let sallesP     = getSallesUseCase.execute(restaurantId: restaurantId)

        sallesP
            .flatMap { [weak self] salles -> AnyPublisher<([Salle], [Table], [Commande], [Reservation]), AuthError> in
                guard let self else { return Fail(error: .unknown).eraseToAnyPublisher() }
                let tablesP       = self.getTablesUseCase.execute(salleId: nil)
                let commandesP    = self.getCommandesUseCase.execute(restaurantId: self.restaurantId)
                let reservationsP = self.getReservationsUseCase.execute(restaurantId: self.restaurantId)
                return Publishers.Zip3(tablesP, commandesP, reservationsP)
                    .map { (salles, $0, $1, $2) }
                    .eraseToAnyPublisher()
            }
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

    // MARK: - Articles par catégorie
    public var articlesByCategory: [CategoryWithArticles] {
        guard case .success(let data) = uiState else { return [] }
        return data.categories
            .sorted {
                $0.displayOrder != $1.displayOrder
                    ? $0.displayOrder < $1.displayOrder
                    : $0.name < $1.name
            }
            .compactMap { category in
                let articles = data.articles.filter { $0.categoryId == category.id }
                guard !articles.isEmpty else { return nil }
                return CategoryWithArticles(category: category, articles: articles)
            }
    }

    public struct CategoryWithArticles: Identifiable {
        public let id:       Int
        public let category: Category
        public let articles: [Article]

        init(category: Category, articles: [Article]) {
            self.id       = category.id
            self.category = category
            self.articles = articles
        }
    }
}

import Foundation

public final class DependencyContainer {

    public static let shared = DependencyContainer()
    private init() {}

    public lazy var networkClient = NetworkClient()

    private lazy var authDataSource:     AuthDataSource        = AuthDataSourceImpl(networkClient: networkClient)
    private lazy var homeDataSource:     HomeDataSource        = HomeDataSourceImpl(networkClient: networkClient)
    private lazy var tableDataSource:    TableActionDataSource = TableActionDataSourceImpl(networkClient: networkClient)
    private lazy var planningDataSource: PlanningDataSource    = PlanningDataSourceImpl(networkClient: networkClient)
    private lazy var orderDataSource:    OrderRemoteDataSource = OrderRemoteDataSourceImpl(networkClient: networkClient)

    private lazy var authRepository: AuthRepositoryProtocol =
        AuthRepositoryImpl(dataSource: authDataSource, keychainManager: .shared)

    private lazy var planningRepository: PlanningRepositoryProtocol =
        PlanningRepositoryImpl(dataSource: planningDataSource)

    private lazy var articleRepository: ArticleRepositoryProtocol =
        ArticleRepositoryImpl(dataSource: homeDataSource)

    private lazy var categoryRepository: CategoryRepositoryProtocol =
        CategoryRepositoryImpl(dataSource: homeDataSource)

    private lazy var salleRepository: SalleRepositoryProtocol =
        SalleRepositoryImpl(dataSource: homeDataSource)

    private lazy var tableRepository: TableRepositoryProtocol =
        TableRepositoryImpl(
            homeDataSource:  homeDataSource,
            tableDataSource: tableDataSource
        )

    private lazy var commandeRepository: CommandeRepositoryProtocol =
        CommandeRepositoryImpl(dataSource: homeDataSource)

    private lazy var reservationRepository: ReservationRepositoryProtocol =
        ReservationRepositoryImpl(dataSource: homeDataSource)

    private lazy var orderRepository: OrderRepositoryProtocol =
        OrderRepositoryImpl(dataSource: orderDataSource)

    public lazy var deviceLoginUseCase = DeviceLoginUseCase(repository: authRepository)
    public lazy var quickLoginUseCase  = QuickLoginUseCase(repository: authRepository)
    public lazy var logoutUseCase      = LogoutUseCase()

    public lazy var getWeekPlanningUseCase = GetWeekPlanningUseCase(repository: planningRepository)

    public lazy var getArticlesUseCase     = GetArticlesUseCase(repository: articleRepository)
    public lazy var getCategoriesUseCase   = GetCategoriesUseCase(repository: categoryRepository)
    public lazy var getSallesUseCase       = GetSallesUseCase(repository: salleRepository)
    public lazy var getTablesUseCase       = GetTablesUseCase(repository: tableRepository)
    public lazy var getCommandesUseCase    = GetCommandesUseCase(repository: commandeRepository)
    public lazy var getReservationsUseCase = GetReservationsUseCase(repository: reservationRepository)

    public lazy var createReservationUseCase = CreateReservationUseCase(repository: reservationRepository)
    public lazy var updateReservationUseCase = UpdateReservationUseCase(repository: reservationRepository)
    public lazy var deleteReservationUseCase = DeleteReservationUseCase(repository: reservationRepository)

    public lazy var findOrCreateTableUseCase = FindOrCreateTableUseCase(
        repository: tableRepository
    )

    private lazy var createOrderUseCase  = CreateOrderUseCase(repository: orderRepository)
    private lazy var addOrderLineUseCase = AddOrderLineUseCase(repository: orderRepository)
    public lazy var sendOrderUseCase     = SendOrderUseCase(
        createOrderUseCase:  createOrderUseCase,
        addOrderLineUseCase: addOrderLineUseCase
    )
}

import Foundation

public final class DependencyContainer {

    public static let shared = DependencyContainer()
    private init() {}

    // MARK: - Core
    public lazy var networkClient = NetworkClient()

    // MARK: - DataSources
    private lazy var authDataSource:     AuthDataSource        = AuthDataSourceImpl(networkClient: networkClient)
    private lazy var homeDataSource:     HomeDataSource        = HomeDataSourceImpl(networkClient: networkClient)
    private lazy var tableDataSource:    TableActionDataSource = TableActionDataSourceImpl(networkClient: networkClient)
    private lazy var planningDataSource: PlanningDataSource    = PlanningDataSourceImpl(networkClient: networkClient)
    private lazy var orderDataSource:    OrderRemoteDataSource = OrderRemoteDataSourceImpl(networkClient: networkClient)

    // MARK: - Repositories
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
            homeDataSource:  homeDataSource,  // ✅ label correct
            tableDataSource: tableDataSource
        )

    private lazy var commandeRepository: CommandeRepositoryProtocol =
        CommandeRepositoryImpl(dataSource: homeDataSource)

    private lazy var reservationRepository: ReservationRepositoryProtocol =
        ReservationRepositoryImpl(dataSource: homeDataSource)

    private lazy var orderRepository: OrderRepositoryProtocol =
        OrderRepositoryImpl(dataSource: orderDataSource)

    // MARK: - UseCases — Auth
    public lazy var deviceLoginUseCase = DeviceLoginUseCase(repository: authRepository)
    public lazy var quickLoginUseCase  = QuickLoginUseCase(repository: authRepository)
    public lazy var logoutUseCase      = LogoutUseCase()

    // MARK: - UseCases — Planning
    public lazy var getWeekPlanningUseCase = GetWeekPlanningUseCase(repository: planningRepository)

    // MARK: - UseCases — Home
    public lazy var getArticlesUseCase     = GetArticlesUseCase(repository: articleRepository)
    public lazy var getCategoriesUseCase   = GetCategoriesUseCase(repository: categoryRepository)
    public lazy var getSallesUseCase       = GetSallesUseCase(repository: salleRepository)
    public lazy var getTablesUseCase       = GetTablesUseCase(repository: tableRepository)
    public lazy var getCommandesUseCase    = GetCommandesUseCase(repository: commandeRepository)
    public lazy var getReservationsUseCase = GetReservationsUseCase(repository: reservationRepository)

    // MARK: - UseCases — Reservation CRUD
    public lazy var createReservationUseCase = CreateReservationUseCase(repository: reservationRepository)
    public lazy var updateReservationUseCase = UpdateReservationUseCase(repository: reservationRepository)
    public lazy var deleteReservationUseCase = DeleteReservationUseCase(repository: reservationRepository)

    // MARK: - UseCases — Table
    public lazy var findOrCreateTableUseCase = FindOrCreateTableUseCase(  // ✅ UseCase pas le protocol
        repository: tableRepository
    )

    // MARK: - UseCases — Order
    private lazy var createOrderUseCase  = CreateOrderUseCase(repository: orderRepository)
    private lazy var addOrderLineUseCase = AddOrderLineUseCase(repository: orderRepository)
    public lazy var sendOrderUseCase     = SendOrderUseCase(
        createOrderUseCase:  createOrderUseCase,
        addOrderLineUseCase: addOrderLineUseCase
    )
}

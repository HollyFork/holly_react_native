public final class DependencyContainer {

    public static let shared = DependencyContainer()
    private init() {}

    // MARK: - Core
    private lazy var networkClient = NetworkClient()

    // MARK: - Auth
    private lazy var authDataSource: AuthDataSource = AuthDataSourceImpl(
        networkClient: networkClient
    )
    private lazy var authRepository: AuthRepositoryProtocol = AuthRepositoryImpl(
        dataSource:      authDataSource,
        keychainManager: .shared
    )

    // MARK: - Planning
    private lazy var planningDataSource: PlanningDataSource = PlanningDataSourceImpl(
        networkClient: networkClient
    )
    private lazy var planningRepository: PlanningRepositoryProtocol = PlanningRepositoryImpl(
        dataSource: planningDataSource
    )

    // MARK: - UseCases — Auth
    public lazy var deviceLoginUseCase = DeviceLoginUseCase(repository: authRepository)
    public lazy var quickLoginUseCase  = QuickLoginUseCase(repository: authRepository)
    public lazy var logoutUseCase      = LogoutUseCase()

    // MARK: - UseCases — Planning
    public lazy var getWeekPlanningUseCase = GetWeekPlanningUseCase(repository: planningRepository)
}

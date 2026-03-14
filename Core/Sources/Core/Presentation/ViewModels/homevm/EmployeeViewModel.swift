import Foundation
import Combine

@MainActor
public final class EmployeeViewModel: ObservableObject {

    @Published public var planningUiState: PlanningUiState = .idle
    @Published public private(set) var employeeName: String
    @Published public private(set) var employeeType: String

    private let getWeekPlanningUseCase: GetWeekPlanningUseCase
    private var cancellables = Set<AnyCancellable>()
    private let employeeId:   Int
    private let restaurantId: Int

    public init(
        getWeekPlanningUseCase: GetWeekPlanningUseCase,
        employeeId:   Int,
        restaurantId: Int
    ) {
        self.getWeekPlanningUseCase = getWeekPlanningUseCase
        self.employeeId             = employeeId
        self.restaurantId           = restaurantId
        self.employeeName           = SessionManager.shared.employeeName ?? "Employé"
        self.employeeType           = SessionManager.shared.employeeType ?? ""
    }

    public func loadPlanning() async {
        planningUiState = .loading

        getWeekPlanningUseCase
            .execute(employeeId: employeeId, restaurantId: restaurantId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.planningUiState = .error(error.errorDescription ?? "Erreur inconnue")
                    }
                },
                receiveValue: { [weak self] planning in
                    if planning.days.isEmpty {
                        self?.planningUiState = .empty
                    } else {
                        self?.planningUiState = .success(
                            days:           planning.days,
                            totalWeekHours: planning.totalWeekHours
                        )
                    }
                }
            )
            .store(in: &cancellables)
    }

    public func refreshPlanning() async { await loadPlanning() }
}

 
import Foundation
import Combine

public enum ReservationSheetMode {
    case create
    case edit(Reservation)
}

public enum ReservationFormUiState: Equatable {
    case idle
    case loading
    case success
    case deleted
    case error(String)
}
import Foundation
import Combine

@MainActor
public final class ReservationViewModel: ObservableObject {

    @Published public var showSheet:   Bool                   = false
    @Published public var sheetMode:   ReservationSheetMode   = .create
    @Published public var formUiState: ReservationFormUiState = .idle
    @Published public var clientName:  String = ""
    @Published public var partySize:   Int    = 2
    @Published public var datetime:    Date   = Date()
    @Published public var phoneNumber: String = ""
    @Published public var salleId:     Int    = 0
    @Published public var serverNote: String = ""
    @Published public var restaurantNote: String = ""
    @Published public var allergies: String = ""
    public var salles: [Salle] = []

    private let createUseCase: CreateReservationUseCase
    private let updateUseCase: UpdateReservationUseCase
    private let deleteUseCase: DeleteReservationUseCase
    private var cancellables = Set<AnyCancellable>()

    public init() {
        let ds   = HomeDataSourceImpl(networkClient: DependencyContainer.shared.networkClient)
        let repo = ReservationRepositoryImpl(dataSource: ds)
        self.createUseCase = CreateReservationUseCase(repository: repo)
        self.updateUseCase = UpdateReservationUseCase(repository: repo)
        self.deleteUseCase = DeleteReservationUseCase(repository: repo)
    }

    public func openCreate(salles: [Salle]) {
        self.salles = salles; salleId = salles.first?.id ?? 0
        clientName = ""; partySize = 2; datetime = Date(); phoneNumber = ""
        formUiState = .idle; sheetMode = .create; showSheet = true
    }

    public func openEdit(_ reservation: Reservation, salles: [Salle]) {
        self.salles = salles
        clientName  = reservation.clientName
        partySize   = reservation.partySize
        datetime    = reservation.datetime
        phoneNumber = reservation.phoneNumber ?? ""
        salleId     = reservation.salleId
        serverNote = ""
        restaurantNote = ""
        allergies = ""
        formUiState = .idle; sheetMode = .edit(reservation); showSheet = true
    }

    public func save() async {
        formUiState = .loading
        let request = CreateReservationRequest(
            clientName:  clientName,
            partySize:   partySize,
            datetime:    datetime,
            phoneNumber: phoneNumber.isEmpty ? nil : phoneNumber,
            salleId:     salleId
        )
        let publisher: AnyPublisher<Reservation, AuthError> = {
            if case .edit(let existing) = sheetMode {
                return updateUseCase.execute(id: existing.id, request)
            }
            return createUseCase.execute(request)
        }()
        publisher
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] c in
                    if case .failure(let e) = c { self?.formUiState = .error(e.errorDescription ?? "Erreur") }
                },
                receiveValue: { [weak self] _ in
                    self?.formUiState = .success; self?.showSheet = false
                }
            )
            .store(in: &cancellables)
    }

    public func delete() async {
        guard case .edit(let existing) = sheetMode else { return }
        formUiState = .loading
        deleteUseCase.execute(id: existing.id)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] c in
                    if case .failure(let e) = c { self?.formUiState = .error(e.errorDescription ?? "Erreur") }
                },
                receiveValue: { [weak self] in
                    self?.formUiState = .deleted; self?.showSheet = false
                }
            )
            .store(in: &cancellables)
    }

    public var isEditMode: Bool { if case .edit = sheetMode { return true }; return false }
    public var isFormValid: Bool { !clientName.isEmpty && partySize > 0 && salleId > 0 }
}


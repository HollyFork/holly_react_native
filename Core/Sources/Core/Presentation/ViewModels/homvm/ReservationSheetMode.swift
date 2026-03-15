//
//  ReservationSheetMode.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


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

@MainActor
public final class ReservationViewModel: ObservableObject {

    // MARK: - Sheet state
    @Published public var showSheet:          Bool               = false
    @Published public var sheetMode:          ReservationSheetMode = .create

    // MARK: - Form fields
    @Published public var clientName:  String = ""
    @Published public var partySize:   Int    = 2
    @Published public var datetime:    Date   = Date()
    @Published public var phoneNumber: String = ""
    @Published public var salleId:     Int    = 0

    // MARK: - UI State
    @Published public var formUiState: ReservationFormUiState = .idle

    // MARK: - Data
    public var salles: [Salle] = []

    private let createUseCase: CreateReservationUseCase
    private let updateUseCase: UpdateReservationUseCase
    private let deleteUseCase: DeleteReservationUseCase
    private var cancellables   = Set<AnyCancellable>()

    public init(
        createUseCase: CreateReservationUseCase,
        updateUseCase: UpdateReservationUseCase,
        deleteUseCase: DeleteReservationUseCase
    ) {
        self.createUseCase = createUseCase
        self.updateUseCase = updateUseCase
        self.deleteUseCase = deleteUseCase
    }

    // MARK: - Open sheet
    public func openCreate(salles: [Salle]) {
        self.salles      = salles
        self.salleId     = salles.first?.id ?? 0
        self.clientName  = ""
        self.partySize   = 2
        self.datetime    = Date()
        self.phoneNumber = ""
        self.formUiState = .idle
        self.sheetMode   = .create
        self.showSheet   = true
    }

    public func openEdit(_ reservation: Reservation, salles: [Salle]) {
        self.salles      = salles
        self.clientName  = reservation.clientName
        self.partySize   = reservation.partySize
        self.datetime    = reservation.datetime
        self.phoneNumber = reservation.phoneNumber ?? ""
        self.salleId     = reservation.salleId
        self.formUiState = .idle
        self.sheetMode   = .edit(reservation)
        self.showSheet   = true
    }

    // MARK: - Save
    public func save() async {
        formUiState = .loading

        let request = CreateReservationRequest(
            clientName:  clientName,
            partySize:   partySize,
            datetime:    datetime,
            phoneNumber: phoneNumber.isEmpty ? nil : phoneNumber,
            salleId:     salleId
        )

        let publisher: AnyPublisher<Reservation, AuthError>

        if case .edit(let existing) = sheetMode {
            publisher = updateUseCase.execute(id: existing.id, request)
        } else {
            publisher = createUseCase.execute(request)
        }

        publisher
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.formUiState = .error(error.errorDescription ?? "Erreur")
                    }
                },
                receiveValue: { [weak self] _ in
                    self?.formUiState = .success
                    self?.showSheet   = false
                }
            )
            .store(in: &cancellables)
    }

    // MARK: - Delete
    public func delete() async {
        guard case .edit(let existing) = sheetMode else { return }
        formUiState = .loading

        deleteUseCase.execute(id: existing.id)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.formUiState = .error(error.errorDescription ?? "Erreur")
                    }
                },
                receiveValue: { [weak self] in
                    self?.formUiState = .deleted
                    self?.showSheet   = false
                }
            )
            .store(in: &cancellables)
    }

    // MARK: - Helpers
    public var isEditMode: Bool {
        if case .edit = sheetMode { return true }
        return false
    }

    public var isFormValid: Bool {
        !clientName.isEmpty && partySize > 0 && salleId > 0
    }
}
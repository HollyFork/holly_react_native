//
//  HomeViewModel.swift
//  Core
//
//  Created by Hadj Rabah on 04/03/2026.
//


import SwiftUI

@MainActor
class HomeViewModel: ObservableObject {

    @Published var uiState: HomeUiState = .idle
    @Published var shifts: [ShiftResponse] = []

    private let getMyPlanningUseCase: GetMyPlanningUseCase

    init(getMyPlanningUseCase: GetMyPlanningUseCase) {
        self.getMyPlanningUseCase = getMyPlanningUseCase
    }

    func loadMyPlanning() async {
        uiState = .loading
        do {
            // ✅ On filtre seulement par employé
            let employeeId = SessionCache.shared.employeeId
            let shifts = try await getMyPlanningUseCase.execute(
                employeeId: SessionCache.shared.employeeId,
                restaurantId: nil,
                week: nil
            )
            self.shifts = shifts
            uiState = .success
        } catch {
            uiState = .error(message: error.localizedDescription)
        }
    }

    // Pour afficher rapidement le planning dans un Text
    var shiftsText: String {
        shifts.map { shift in
            """
            \(shift.type_shift) - \(shift.date_debut) à \(shift.date_fin)
            Notes: \(shift.notes ?? "Aucune")
            """
        }.joined(separator: "\n\n")
    }
}

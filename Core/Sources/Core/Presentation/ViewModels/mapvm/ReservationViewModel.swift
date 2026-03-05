import Foundation
import SwiftUI

@MainActor
class ReservationViewModel: ObservableObject {
    
    @Published var uiState: ReservationUiState = .idle
    
    private let getReservationsUseCase: GetReservationsUseCase
    
    init(getReservationsUseCase: GetReservationsUseCase) {
        self.getReservationsUseCase = getReservationsUseCase
    }
    
    func loadReservations() async {
        
        guard let restaurantId = SessionCache.shared.restaurantId else {
            uiState = .error("Restaurant ID manquant")
            return
        }
        
        uiState = .loading
        
        do {
            let reservations = try await getReservationsUseCase
                .execute(restaurantId: restaurantId, date: Date())
            
            uiState = .success(reservations.sorted {
                $0.dateTime < $1.dateTime
            })
            
        } catch {
            uiState = .error(error.localizedDescription)
        }
    }
}
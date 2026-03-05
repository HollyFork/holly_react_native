// DeleteReservationUseCase.swift
import Foundation

public protocol DeleteReservationUseCase {
    func execute(id: Int) async throws
}

public class DeleteReservationUseCaseImpl: DeleteReservationUseCase {
    private let repository: ReservationRepository
    
    public init(repository: ReservationRepository) {
        self.repository = repository
    }
    
    public func execute(id: Int) async throws {
        try await repository.deleteReservation(id: id)
    }
}

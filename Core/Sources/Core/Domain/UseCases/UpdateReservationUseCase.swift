// Core/Domain/UseCases/UpdateReservationUseCase.swift
import Foundation

public protocol UpdateReservationUseCase {
    func execute(id: Int, body: ReservationUpdateRequest) async throws -> Reservation
}

public struct ReservationUpdateRequest {
    public let clientName: String
    public let numberOfPeople: Int
    public let dateTime: Date
    public let phone: String
    public let author: String?
    public let clientNote: String?
    public let reservationNote: String?
    public let allergies: String?
    public let mealDuration: String?

    public init(
        clientName: String,
        numberOfPeople: Int,
        dateTime: Date,
        phone: String,
        author: String? = nil,
        clientNote: String? = nil,
        reservationNote: String? = nil,
        allergies: String? = nil,
        mealDuration: String? = nil
    ) {
        self.clientName = clientName
        self.numberOfPeople = numberOfPeople
        self.dateTime = dateTime
        self.phone = phone
        self.author = author
        self.clientNote = clientNote
        self.reservationNote = reservationNote
        self.allergies = allergies
        self.mealDuration = mealDuration
    }
}

public class UpdateReservationUseCaseImpl: UpdateReservationUseCase {
    private let repository: ReservationRepository

    public init(repository: ReservationRepository) {
        self.repository = repository
    }

    public func execute(id: Int, body: ReservationUpdateRequest) async throws -> Reservation {
        return try await repository.updateReservation(id: id, body: body)
    }
}
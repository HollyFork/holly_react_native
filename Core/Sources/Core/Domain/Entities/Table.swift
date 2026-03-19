
import Foundation

public struct Table: Identifiable, Equatable {
    public let id:                 Int
    public let numero:             Int
    public let capacity:           Int
    public let reservedSeats:      Int
    public let isOccupied:         Bool
    public let salleId:            Int
    public let positionX:          Int?
    public let positionY:          Int?
    public let employeeInChargeId: Int?    

    public init(
        id:                 Int,
        numero:             Int,
        capacity:           Int,
        reservedSeats:      Int  = 0,
        isOccupied:         Bool = false,
        salleId:            Int,
        positionX:          Int? = nil,
        positionY:          Int? = nil,
        employeeInChargeId: Int? = nil
    ) {
        self.id                 = id
        self.numero             = numero
        self.capacity           = capacity
        self.reservedSeats      = reservedSeats
        self.isOccupied         = isOccupied
        self.salleId            = salleId
        self.positionX          = positionX
        self.positionY          = positionY
        self.employeeInChargeId = employeeInChargeId
    }
}


public struct TableDetail: Equatable {
    public let id:                  Int
    public let numero:              Int
    public let capacity:            Int
    public let isOccupied:          Bool
    public let salleId:             Int
    public let salleName:           String
    public let existingCommandeId:  Int?
    public let existingOrderItems:  [OrderLine]  

    public init(
        id:                 Int,
        numero:             Int,
        capacity:           Int,
        isOccupied:         Bool,
        salleId:            Int,
        salleName:          String,
        existingCommandeId: Int?        = nil,
        existingOrderItems: [OrderLine] = []
    ) {
        self.id                 = id
        self.numero             = numero
        self.capacity           = capacity
        self.isOccupied         = isOccupied
        self.salleId            = salleId
        self.salleName          = salleName
        self.existingCommandeId = existingCommandeId
        self.existingOrderItems = existingOrderItems
    }
}

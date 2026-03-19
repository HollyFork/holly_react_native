
import Foundation

public struct Order: Equatable {
    public let id:         Int
    public let tableId:    Int
    public let amount:     String
    public let itemsCount: Int
    public let status:     String

    public init(
        id:         Int,
        tableId:    Int,
        amount:     String,
        itemsCount: Int,
        status:     String
    ) {
        self.id         = id
        self.tableId    = tableId
        self.amount     = amount
        self.itemsCount = itemsCount
        self.status     = status
    }
}

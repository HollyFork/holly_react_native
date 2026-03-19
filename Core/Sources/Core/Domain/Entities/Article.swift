
import Foundation

public struct Article: Identifiable, Equatable {
    public let id:          Int
    public let name:        String
    public let price:       String
    public let description: String?
    public let available:   Bool
    public let categoryId:  Int
    public let categoryName: String
}

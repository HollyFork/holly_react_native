import Foundation

public struct TypeEmployeResponseDTO: Codable {
    let id: Int
    let nomType: String
    let description: String
    
    public  enum CodingKeys: String, CodingKey {
        case id
        case nomType = "nom_type"
        case description
    }
}

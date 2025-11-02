
import Foundation

public struct IngredientResponseDTO: Codable {
    let id: Int
    let nom: String
    let unite: String
    let prixUnitaire: Double
    
    public  enum CodingKeys: String, CodingKey {
        case id
        case nom
        case unite
        case prixUnitaire = "prix_unitaire"
    }
}


public extension IngredientResponseDTO {
    func toDomain() -> Ingredient {
        return Ingredient(
            id: self.id,
            nom: self.nom,
            unite: self.unite,
            prixUnitaire: self.prixUnitaire
        )
    }
}

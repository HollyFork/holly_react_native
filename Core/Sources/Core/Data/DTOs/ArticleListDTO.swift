import Foundation

struct ArticleListDTO: Decodable {
    let count:   Int
    let next:    String?
    let previous: String?
    let results: [ArticleDTO]
}

struct ArticleDTO: Decodable {
    let id:           Int
    let name:         String
    let restaurantId: Int?
    let categorieId:  Int
    let categorieName: String
    let price:        String
    let description:  String?
    let available:    Bool
    let ingredients:  [ArticleIngredientDTO]?

    enum CodingKeys: String, CodingKey {
        case id, name, price, description, available, ingredients
        case restaurantId  = "restaurant_id"
        case categorieId   = "categorie_id"
        case categorieName = "categorie_name"
    }

    func toDomain() -> Article {
        Article(
            id:           id,
            name:         name,
            price:        price,
            description:  description,
            available:    available,
            categoryId:   categorieId,
            categoryName: categorieName
        )
    }
}

struct ArticleIngredientDTO: Decodable {
    let id:               Int
    let requiredQuantity: String
    let articleId:        Int
    let ingredientId:     Int
    let ingredientName:   String

    enum CodingKeys: String, CodingKey {
        case id, articleId = "article_id"
        case requiredQuantity = "required_quantity"
        case ingredientId     = "ingredient_id"
        case ingredientName   = "ingredient_name"
    }
}

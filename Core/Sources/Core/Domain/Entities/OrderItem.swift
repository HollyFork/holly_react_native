struct OrderItem: Identifiable {
    let id: Int
    let article: Article
    var quantity: Int

    var totalPrice: Double {
        Double(quantity) * article.price
    }
}
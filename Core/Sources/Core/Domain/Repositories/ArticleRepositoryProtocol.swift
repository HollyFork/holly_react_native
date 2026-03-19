


import Combine

public protocol ArticleRepositoryProtocol {
    func getArticles(disponible: Bool?) -> AnyPublisher<[Article], AuthError>
}

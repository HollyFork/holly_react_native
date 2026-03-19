
import Combine

final class PlanningDataSourceImpl: PlanningDataSource {

    private let networkClient: NetworkClient

    init(networkClient: NetworkClient) {
        self.networkClient = networkClient
    }

    func getEmploiDuTemps(filter: PlanningFilter) -> AnyPublisher<EmploiDuTempsResponseDTO, AuthError> {
        networkClient.getWithParams(
            endpoint: .emploiDuTemps,
            queryItems: filter.queryItems
        )
    }
}

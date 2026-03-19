
import Combine

protocol PlanningDataSource {
    func getEmploiDuTemps(filter: PlanningFilter) -> AnyPublisher<EmploiDuTempsResponseDTO, AuthError>
}

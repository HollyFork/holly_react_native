import Foundation
import Combine

@MainActor
public final class DeviceLoginViewModel: ObservableObject {

    @Published public var uiState: UiState = .idle

    private let deviceLoginUseCase: DeviceLoginUseCase
    private var cancellables = Set<AnyCancellable>()

    public init(deviceLoginUseCase: DeviceLoginUseCase) {
        self.deviceLoginUseCase = deviceLoginUseCase
    }

    public var hasError: Bool { uiState.hasError }

    // MARK: - Actions
    public func configureDevice(restaurantId: Int, pinRestaurant: String) async {
        guard !pinRestaurant.isEmpty, restaurantId > 0 else {
            uiState = .error("Veuillez remplir tous les champs.")
            return
        }

        uiState = .loading

        deviceLoginUseCase
            .execute(restaurantId: restaurantId, pinRestaurant: pinRestaurant)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.uiState = .error(error.errorDescription ?? "Erreur inconnue")
                    }
                },
                receiveValue: { [weak self] _ in
                    self?.uiState = .success
                }
            )
            .store(in: &cancellables)
    }
}

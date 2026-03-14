import Foundation
import Combine

@MainActor
public final class QuickLoginViewModel: ObservableObject {

    @Published public var uiState: UiState = .idle
    public var pinCode: String = ""

    private let quickLoginUseCase: QuickLoginUseCase
    private var cancellables = Set<AnyCancellable>()

    public init(quickLoginUseCase: QuickLoginUseCase) {
        self.quickLoginUseCase = quickLoginUseCase
    }

    // MARK: - Actions
    public func login() async {
        guard pinCode.count == 4 else {
            uiState = .error("Le code PIN doit contenir 4 chiffres.")
            return
        }

        uiState = .loading

        quickLoginUseCase
            .execute(pinCode: pinCode)
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

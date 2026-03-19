import Combine

protocol AuthDataSource {
    func deviceLogin(request: DeviceLoginRequestDTO) -> AnyPublisher<DeviceLoginResponseDTO, AuthError>
    func quickLogin(request: QuickLoginRequestDTO)   -> AnyPublisher<QuickLoginResponseDTO, AuthError>
}

import Foundation

public protocol LoginRepository {
    func login(username: String, password: String) async throws -> UserSession
}

public class LoginRepositoryImpl: LoginRepository {
    
    private let loginRemoteDataSource: LoginRemoteDataSource
    
    public init(loginRemoteDataSource: LoginRemoteDataSource) {
        self.loginRemoteDataSource = loginRemoteDataSource
    }
    
    public func login(username: String, password: String) async throws -> UserSession {
        let request = LoginRequest(username: username, password: password)
        let dto = try await loginRemoteDataSource.login(request: request)
        return UserSession(
            token: dto.accessToken,
            userId: dto.idUser,
            refreshToken: dto.refreshToken
        )
    }
}

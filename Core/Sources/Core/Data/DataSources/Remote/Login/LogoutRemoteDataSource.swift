import Foundation

public protocol LogoutRemoteDataSource {
    func logout(completion: @escaping (Result<String, Error>) -> Void)
}

public class LogoutRemoteDataSourceImpl: LogoutRemoteDataSource {
    
    public init() {}

    public func logout(completion: @escaping (Result<String, Error>) -> Void) {
        NetworkManager.shared.logout(completion: completion)
    }
}

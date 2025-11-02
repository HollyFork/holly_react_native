import Foundation

public protocol LogoutRepository {
    func logout(completion: @escaping (Result<String, Error>) -> Void)
}

public class LogoutRepositoryImpl: LogoutRepository {
    
    private let remoteDataSource: LogoutRemoteDataSource
    
    public init(remoteDataSource: LogoutRemoteDataSource) {
        self.remoteDataSource = remoteDataSource
    }
    
    public func logout(completion: @escaping (Result<String, Error>) -> Void) {
        remoteDataSource.logout(completion: completion)
    }
}

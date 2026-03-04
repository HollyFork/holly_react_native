import Foundation


public protocol DeviceLoginRepository {
    func login(request: DeviceLoginRequest) async throws -> DeviceLoginResponse
}


public class DeviceLoginRepositoryImpl: DeviceLoginRepository {
    
    private let remoteDataSource: DeviceLoginRemoteDataSource
    
    public init(remoteDataSource: DeviceLoginRemoteDataSource) {
        self.remoteDataSource = remoteDataSource
    }
    
    public func login(request: DeviceLoginRequest) async throws -> DeviceLoginResponse {
        let response = try await remoteDataSource.login(request: request)
        
        // ✅ FIX : Sauvegarde du device_token dans Keychain pour persistance entre sessions
        _ = KeychainManager.shared.saveDeviceToken(response.device_token)
        SessionCache.shared.deviceToken = response.device_token
        
        return response
    }
}

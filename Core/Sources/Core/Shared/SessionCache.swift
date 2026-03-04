import Foundation

public final class SessionCache {
    public static let shared = SessionCache()
    private init() {}
    
    // Device login token
    public var deviceToken: String?
    
    // Employee info
    public var employeeId: Int?
    public var employeeName: String?
    public var employeeFirstName: String?
    public var employeeLastName: String?
    public var employeeRole: String?
    public var employeeTypeId: Int?
    public var restaurantId: Int?
    public var restaurantName: String?
    
    // Tokens
    public var accessToken: String?
    public var refreshToken: String?
    
    public func clearEmployeeSession() {
        employeeId = nil
        employeeName = nil
        employeeFirstName = nil
        employeeLastName = nil
        employeeRole = nil
        employeeTypeId = nil
        restaurantId = nil
        restaurantName = nil
        accessToken = nil
        refreshToken = nil
    }
}

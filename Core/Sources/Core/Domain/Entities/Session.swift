

public struct Session: Equatable {
    public let accessToken: String
    public let refreshToken: String
    public let userId: Int
    public let username: String
    public let employeeId: Int
    public let employeeName: String
    public let employeeFirstName: String
    public let employeeLastName: String
    public let employeeType: String
    public let employeeTypeId: Int
    public let restaurantId: Int
    public let restaurantName: String

    public init(
        accessToken: String,
        refreshToken: String,
        userId: Int,
        username: String,
        employeeId: Int,
        employeeName: String,
        employeeFirstName: String,
        employeeLastName: String,
        employeeType: String,
        employeeTypeId: Int,
        restaurantId: Int,
        restaurantName: String
    ) {
        self.accessToken       = accessToken
        self.refreshToken      = refreshToken
        self.userId            = userId
        self.username          = username
        self.employeeId        = employeeId
        self.employeeName      = employeeName
        self.employeeFirstName = employeeFirstName
        self.employeeLastName  = employeeLastName
        self.employeeType      = employeeType
        self.employeeTypeId    = employeeTypeId
        self.restaurantId      = restaurantId
        self.restaurantName    = restaurantName
    }
}

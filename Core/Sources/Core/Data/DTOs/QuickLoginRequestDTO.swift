
struct QuickLoginRequestDTO: Encodable {
    let deviceToken: String
    let pinCode: String

    enum CodingKeys: String, CodingKey {
        case deviceToken = "device_token"
        case pinCode     = "pin_code"
    }
}

struct QuickLoginResponseDTO: Decodable {
    let message: String
    let accessToken: String
    let refreshToken: String
    let userId: Int
    let username: String
    let employeeId: Int
    let employeeName: String
    let employeeFirstName: String
    let employeeLastName: String
    let employeeType: String
    let employeeTypeId: Int
    let restaurantId: Int
    let restaurantName: String

    enum CodingKeys: String, CodingKey {
        case message
        case accessToken      = "access_token"
        case refreshToken     = "refresh_token"
        case userId           = "user_id"
        case username
        case employeeId       = "employee_id"
        case employeeName     = "employee_name"
        case employeeFirstName = "employee_first_name"
        case employeeLastName  = "employee_last_name"
        case employeeType      = "employee_type"
        case employeeTypeId    = "employee_type_id"
        case restaurantId      = "restaurant_id"
        case restaurantName    = "restaurant_name"
    }
}

extension QuickLoginResponseDTO {
    func toDomain() -> Session {
        Session(
            accessToken:       accessToken,
            refreshToken:      refreshToken,
            userId:            userId,
            username:          username,
            employeeId:        employeeId,
            employeeName:      employeeName,
            employeeFirstName: employeeFirstName,
            employeeLastName:  employeeLastName,
            employeeType:      employeeType,
            employeeTypeId:    employeeTypeId,
            restaurantId:      restaurantId,
            restaurantName:    restaurantName
        )
    }
}

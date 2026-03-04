import Foundation

public struct EmployeeLoginResponse: Codable {
    let message: String
    let access_token: String
    let refresh_token: String
    let user_id: Int
    let username: String
    let employee_id: Int
    let employee_name: String
    let employee_first_name: String
    let employee_last_name: String
    let employee_type: String
    let employee_type_id: Int
    let restaurant_id: Int
    let restaurant_name: String
}

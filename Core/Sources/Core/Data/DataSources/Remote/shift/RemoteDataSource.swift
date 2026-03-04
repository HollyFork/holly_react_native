import Foundation

public protocol PlanningRemoteDataSource {
    func getShifts(employeeId: Int?, restaurantId: Int?, week: String?) async throws -> [ShiftResponse]
}

public class PlanningRemoteDataSourceImpl: PlanningRemoteDataSource {
    
    public init() {}
    
    public func getShifts(employeeId: Int? = nil, restaurantId: Int? = nil, week: String? = nil) async throws -> [ShiftResponse] {
        // Construire l'URL avec les filtres
        var urlComponents = URLComponents(string: "http://localhost:8000/api/planning/shifts/")!
        var queryItems: [URLQueryItem] = []
        if let employeeId { queryItems.append(URLQueryItem(name: "employe_id", value: "\(employeeId)")) }
        if let restaurantId { queryItems.append(URLQueryItem(name: "restaurant_id", value: "\(restaurantId)")) }
        if let week { queryItems.append(URLQueryItem(name: "week", value: week)) }
        urlComponents.queryItems = queryItems.isEmpty ? nil : queryItems
        
        guard let url = urlComponents.url else { fatalError("URL invalide") }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = SessionCache.shared.accessToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        print("📤 URL Planning: \(request.url?.absoluteString ?? "")")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        if let httpResponse = response as? HTTPURLResponse {
            print("📥 Status Code Planning: \(httpResponse.statusCode)")
        }
        
        let responseText = String(data: data, encoding: .utf8) ?? ""
        print("📥 Response Planning Raw: \(responseText)")
        
        do {
            let wrapper = try JSONDecoder().decode(ShiftsResponseWrapper.self, from: data)
            return wrapper.results
        } catch {
            print("❌ Erreur decoding Planning : \(error)")
            throw error
        }
    }
}

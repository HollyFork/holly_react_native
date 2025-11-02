import SwiftUI


import SwiftUI

public struct TestJSONView: View {
    
    var onNavigate: (() -> Void)? = nil

    @State private var jsonResponse: String = "Appuyez sur un bouton pour charger les données."
    
    private let endpoints: [APIEndpoint] = [
        .restaurants,
        .employees,
        .restaurantEmployees,
        .employeeTypes,
        .ingredients,
        .stocks,
        .articles,
        .articleIngredients,
        .orders,
        .orderLines,
        .restocks,
        .rooms,
        .tables,
        .reservations,
        .reviews,
        .categories
    ]
    
    private let columns = [
        GridItem(.flexible(), spacing: 16),
        GridItem(.flexible(), spacing: 16)
    ]
    
    public  var body: some View {
        VStack {
            ScrollView {
                LazyVGrid(columns: columns, spacing: 16) {
                    ForEach(endpoints, id: \.self) { endpoint in
                        Button(action: {
                            loadEndpoint(endpoint)
                        }) {
                            Text(endpoint.rawValue)
                                .multilineTextAlignment(.center)
                                .foregroundColor(.white)
                                .padding()
                                .frame(maxWidth: .infinity)
                                .background(Color.blue)
                                .cornerRadius(8)
                        }
                    }
                }
                .padding()
                
                Text(jsonResponse)
                    .font(.system(.body, design: .monospaced))
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
                    .padding()
            }
            
            Spacer()
        }
        .padding()
    }
    
    private func loadEndpoint(_ endpoint: APIEndpoint) {
        guard let token = KeychainManager.shared.getToken() else {
            jsonResponse = "Pas de token disponible, veuillez vous connecter."
            print("Pas de token disponible")
            return
        }
        
        guard var urlComponents = URLComponents(url: endpoint.url!, resolvingAgainstBaseURL: false) else {
            jsonResponse = "URL invalide pour \(endpoint.rawValue)"
            return
        }
        
        urlComponents.queryItems = [URLQueryItem(name: "format", value: "json")]
        guard let url = urlComponents.url else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        print("URL Requête : \(url)")
        print("Token envoyé : Bearer \(token)")
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                if let error = error {
                    jsonResponse = "Erreur : \(error.localizedDescription)"
                    return
                }
                
                guard let httpResponse = response as? HTTPURLResponse else {
                    jsonResponse = "Pas de réponse HTTP"
                    return
                }
                
                print("Code HTTP : \(httpResponse.statusCode)")
                
                guard let data = data else {
                    jsonResponse = "Aucune donnée reçue"
                    return
                }
                
                if let jsonObject = try? JSONSerialization.jsonObject(with: data, options: []),
                   let prettyData = try? JSONSerialization.data(withJSONObject: jsonObject, options: .prettyPrinted),
                   let prettyString = String(data: prettyData, encoding: .utf8) {
                    print("Réponse formatée :\n\(prettyString)")
                    jsonResponse = prettyString
                } else if let rawString = String(data: data, encoding: .utf8) {
                    print("Réponse brute :\n\(rawString)")
                    jsonResponse = rawString
                } else {
                    jsonResponse = "Impossible de décoder les données"
                }
            }
        }.resume()
    }
}


public struct ComponentTestScreen: View {
    public  var body: some View {
        ScrollView {
            VStack(spacing: 30) {
                
                
                VStack(spacing: 10) {
                    Text("CustomTitle")
                        .font(.headline)
                    CustomTitlePanel(title: "Réservations").frame(height: 60)
                    CustomTitlePanel(title: "Infos de Services").frame(height: 60)
                    CustomTitlePanel(title: "Recherche de table").frame(height: 60)
                }
                VStack(spacing: 10) {
                    Text("CustomReservationCard")
                        .font(.headline)
                    CustomDateTimeWeatherHeader(
                        date: "20/07/2025",
                        time: "12 h 14",
                        showWeatherIcon: true
                    )
                    CustomReservationCard(hourReservation: "12 h 20", numberPersonReservation: 3)
                    CustomReservationCard(hourReservation: "14 h 10", numberPersonReservation: 1)
                    CustomReservationCard(hourReservation: "22 h 20", numberPersonReservation: 2)

                }
          

                VStack(spacing: 10) {
                    Text("CustomDigitButton")
                        .font(.headline)
                    HStack(spacing: 10) {
                        ForEach(["1", "2", "3"], id: \.self) { digit in
                            CustomDigitButton(digit: digit) {
                                print("Bouton \(digit) tapé")
                            }
                        }
                    }
                }
                
                VStack(spacing: 10) {
                    Text("CustomIconButton")
                        .font(.headline)
                    HStack(spacing: 10) {
                        CustomIconButton(systemName: "house.fill") {
                            print("Home tapé")
                        }
                        CustomIconButton(systemName: "printer.fill") {
                            print("Print tapé")
                        }
                        CustomIconButton(systemName: "paperplane.fill") {
                            print("Send tapé")
                        }
                    }
                }
                
                VStack(spacing: 10) {
                    Text("CustomShiftButton")
                        .font(.headline)
                    CustomShiftButton(title: "Shift") {
                        print("Shift/Continuer tapé")
                    }
                }
                
                VStack(spacing: 10) {
                    Text("CustomPrimaryButton")
                        .font(.headline)
                    CustomPrimaryButton(title: "Connexion", action: {
                        await Task.sleep(500_000_000)
                        print("Connexion simulée")
                    }, isActive: true)
                }
                
                VStack(spacing: 10) {
                    Text("CustomTextField & SecureField")
                        .font(.headline)
                    CustomTextField("Email", text: .constant("test@example.com"))
                    CustomSecureField("Mot de passe", text: .constant("1234"))
                }
                
                VStack(spacing: 10) {
                    Text("ServicesInformations")
                        .font(.headline)
                    ServicesInformations(
                        showIcon: true,
                        title: "Rupture :",
                        items: ["Burger", "Frites", "Salade"]
                    )
                }
                
                VStack(spacing: 10) {
                    Text("EmployeeTypeProfile")
                        .font(.headline)
                    EmployeeTypeProfile(
                        employeeName: "Jean Dupont",
                        typeEmployee: "Serveur",
                        profileImage: Image(systemName: "person.fill")
                    )
                }
                
                VStack(spacing: 10) {
                    Text("CustomNumPad - Map")
                        .font(.headline)
                    CustomNumPad(
                        mode: NumPadMode.basic,
                        onDigitTapped: { print("Chiffre \($0)") },
                        onPrintTapped: { print("Print") },
                        onSearchTapped: { print("Search") }
                    )
                    Text("CustomNumPad - Login")
                        .font(.headline)
                    CustomNumPad(
                        mode: NumPadMode.login,
                        onDigitTapped: { print("Chiffre \($0)") },
                        onPrintTapped: { print("Print") },
                        onSearchTapped: { print("Search") }
                    )
                    Text("CustomNumPad - Map / Ipad")
                        .font(.headline)
                    CustomNumPad(
                        mode: NumPadMode.search,
                        onDigitTapped: { print("Chiffre \($0)") },
                        onPrintTapped: { print("Print") },
                        onSearchTapped: { print("Search") }
                    )
                }
                
                VStack(spacing: 10) {
                    Text("CustomEmployeeCalendar")
                        .font(.headline)
                    CustomEmployeeCalendar()
                }
                
                VStack(spacing: 10) {
                    Text("FluxForecastCard")
                        .font(.headline)
                    FluxForecastCard(
                        data: FluxForecastData(
                            morningValue: 75,
                            noonValue: 40,
                            eveningValue: 30,
                            morningTrendUp: true,
                            noonTrendUp: false,
                            eveningTrendUp: true,
                            minTemp: 20,
                            maxTemp: 32
                        )
                    )
                }
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Component Test")
    }
}

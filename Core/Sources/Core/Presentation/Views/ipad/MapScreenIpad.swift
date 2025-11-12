import SwiftUI

public struct MapScreenIpad: View {
    
    @State private var tableNumberInput: String = StringConstants.EMPTY_STRING
    var onHomeButtonClicked: () -> Void
    var onTableButtonClicked: (String) -> Void
    
    @State private var isLoading: Bool = false
    @State private var enteredCode: String = StringConstants.EMPTY_STRING
    @State private var showTableScreen: Bool = false
    @State private var selectedTable: String = ""
    
    public init(onHomeButtonClicked: @escaping () -> Void,
                onTableButtonClicked: @escaping (String) -> Void) {
        self.onHomeButtonClicked = onHomeButtonClicked
        self.onTableButtonClicked = onTableButtonClicked
    }
    
    private let columns = [
        GridItem(.flexible(), spacing: 16),
        GridItem(.flexible(), spacing: 16),
        GridItem(.flexible(), spacing: 16)
    ]
    
    public var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                HStack(spacing: 0) {
                    VStack{
                        Spacer()

                        HStack {
                            EmployeeTypeProfile(
                                employeeName: "Michel",
                                typeEmployeeIsVisible: false,
                                profileImage: Image(systemName: "person.fill"))
                            Spacer()
                        }.overlay(
                            Rectangle()
                                .stroke(Color.black, lineWidth: 1)
                        )
                        
                        if showTableScreen {
                            TableScreen(
                                tableNumber: selectedTable,
                                onBackToMap: {
                                    showTableScreen = false
                                    tableNumberInput = ""
                                }
                            )
                            .frame(width: geometry.size.width * 0.7,
                                   height: geometry.size.height * 0.8)
                        } else {
                            Image("test_map_restaurant_ipad")
                                .resizable()
                                .scaledToFill()
                                .frame(width: geometry.size.width * 0.7,
                                       height: geometry.size.height * 0.8)
                                .clipped()
                        }
                        
                        
                        HStack {
                            CustomIconButton(systemName: "house.fill") {
                                showTableScreen = false
                                tableNumberInput = ""
                                onHomeButtonClicked()
                            }
                            Spacer()
                        }.overlay(
                            VStack {
                                Rectangle()
                                    .fill(Color.black)
                                    .frame(height: 1)
                                Spacer()
                            }
                        )
                    }
                    
                    .frame(width: geometry.size.width * 0.7)
                    
                    VStack {
                        CustomTitlePanel(title: "Réservations").frame(height: 60)
                        CustomDateTimeWeatherHeader(
                            date: "20/07/2025",
                            time: "12 h 14",
                            showWeatherIcon: true
                        )
                        ScrollView {
                            LazyVGrid(columns: columns, spacing: 16) {
                                CustomReservationCard(hourReservation: "12 h 20", numberPersonReservation: 3)
                                CustomReservationCard(hourReservation: "14 h 10", numberPersonReservation: 1)
                                CustomReservationCard(hourReservation: "22 h 20", numberPersonReservation: 2)
                                CustomReservationCard(hourReservation: "12 h 20", numberPersonReservation: 3)
                                CustomReservationCard(hourReservation: "14 h 10", numberPersonReservation: 1)
                                CustomReservationCard(hourReservation: "22 h 20", numberPersonReservation: 2)
                            }
                            .padding(12)
                        }
                        .frame(height: geometry.size.height * 0.25)
                        
                        CustomTitlePanel(title: "Infos de Services").frame(height: 60)
                        ServicesInformations(
                            showIcon: true,
                            title: "Rupture :",
                            items: ["Burger", "Waffle Fries"]
                        )
                        .frame(maxHeight: geometry.size.height * 0.15, alignment: .topLeading)
                        .layoutPriority(1)
                        CustomTitlePanel(title: "Recherche de table").frame(height: 60)
                        CustomNumPad(
                            mode: NumPadMode.basic,
                            onDigitTapped: { digit in
                                if tableNumberInput.count < 3 {
                                    tableNumberInput += digit
                                }
                                onDigitTapped(digit)
                            },
                            onPrintTapped: {
                                handlePrintdButtonClicked()
                            },
                            onSearchTapped: {
                                if !tableNumberInput.isEmpty {
                                    selectedTable = tableNumberInput
                                    showTableScreen = true
                                }
                            }
                        )
                        .scaleEffect(0.6)
                        .frame(maxHeight: geometry.size.height * 0.3,alignment: .trailing)
                    }.overlay(
                        Rectangle()
                            .stroke(Color.black, lineWidth: 1)
                    )
                    .frame(width: geometry.size.width * 0.3)
                }
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
            .background(Color.white)
            .ignoresSafeArea()
            .overlay {
                if isLoading {
                    CustomLoader()
                }
            }
        }
    }
    
    private func handlePrintdButtonClicked() {
        isLoading = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
            isLoading = false
        }
    }
    
    private func onDigitTapped(_ digit: String) {
        if enteredCode.count < 3 {
            enteredCode.append(digit)
        }
    }
}

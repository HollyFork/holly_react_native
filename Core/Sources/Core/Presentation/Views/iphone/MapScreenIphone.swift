
import SwiftUI

public struct MapScreenIphone: View {
    
    @State private var tableNumberInput: String = StringConstants.EMPTY_STRING
    var onHomeButtonClicked: () -> Void
    var onTableButtonClicked: (String) -> Void
    
    @State private var isLoading: Bool = false
    @State private var enteredCode: String = StringConstants.EMPTY_STRING
    
    public init(onHomeButtonClicked: @escaping () -> Void,
                onTableButtonClicked: @escaping (String) -> Void) {
        self.onHomeButtonClicked = onHomeButtonClicked
        self.onTableButtonClicked = onTableButtonClicked
    }
    
    public var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                
                Image("test_map_restaurant")
                    .resizable()
                    .scaledToFill()
                    .frame(width: geometry.size.width,
                           height: geometry.size.height * 0.5)
                    .clipped()
                
                VStack(spacing: 0) {
                    
                    HStack(alignment: .top, spacing: 16) {
                        
                        ServicesInformations(
                            showIcon: true,
                            title: "Rupture :",
                            items: ["Burger", "Waffle Fries"]
                        )
                        .frame(maxWidth: geometry.size.width * 0.4,
                               maxHeight: geometry.size.height * 0.35,alignment: .topLeading)
                        .layoutPriority(1)
                        
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
                                onTableButtonClicked(tableNumberInput)
                            }
                        )
                        .scaleEffect(0.6)
                        .frame(maxWidth: geometry.size.width * 0.45,
                               maxHeight: geometry.size.height * 0.35
                        )
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.top, 20)
                    .padding(.horizontal, 16)
                    
                    Spacer()
                    
                    HStack {
                        CustomIconButton(systemName: "house.fill") {
                            onHomeButtonClicked()
                        }
                        
                        Spacer()
                    }
                    .padding(.horizontal, 30)
                    .padding(.bottom, 16)
                }
                .frame(width: geometry.size.width,
                       height: geometry.size.height * 0.5)
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

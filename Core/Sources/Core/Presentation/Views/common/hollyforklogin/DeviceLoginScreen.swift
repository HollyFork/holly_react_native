import SwiftUI

public struct DeviceLoginScreen: View {
    var onDeviceConfigured: () -> Void
    private let deviceLoginUseCase: DeviceLoginUseCase
    
    @StateObject private var viewModel: DeviceLoginViewModel
    @State private var restaurantID: String = ""
    @State private var pinRestaurant: String = ""
    
    public init(
        onDeviceConfigured: @escaping () -> Void,
        deviceLoginUseCase: DeviceLoginUseCase
    ) {
        self.onDeviceConfigured = onDeviceConfigured
        self.deviceLoginUseCase = deviceLoginUseCase
        _viewModel = StateObject(wrappedValue: DeviceLoginViewModel(deviceLoginUseCase: deviceLoginUseCase))
    }
    
    public var body: some View {
        ZStack {
            VStack(spacing: 30) {
                Spacer()
                
                Image("ic_holly_fork_whithout_bg")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 150, height: 150)
                
                switch viewModel.uiState {
                case .success:
                    VStack(spacing: 20) {
                        Text("Équipement configuré")
                            .font(.title2)
                            .fontWeight(.semibold)
                            .foregroundColor(.black)
                        
                        Image(systemName: "checkmark.circle.fill")
                            .resizable()
                            .foregroundColor(.green)
                            .frame(width: 40, height: 40)
                    }
                    .padding(.top, 20)
                    
                default:
                    VStack(spacing: 20) {
                        Text("Configuration Équipement")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        Text("Entrez l'ID restaurant et le code PIN 6 chiffres")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                        
                        CustomTextField(
                            "ID Restaurant",
                            text: $restaurantID,
                            hasError: viewModel.hasError
                        )
                        .frame(width: 300)
                        .keyboardType(.numberPad)
                        
                        CustomSecureField(
                            "Code PIN Restaurant (6 chiffres)",
                            text: $pinRestaurant,
                            hasError: viewModel.hasError
                        )
                        .frame(width: 300)
                        .keyboardType(.numberPad)
                        
                        if case .error(let message) = viewModel.uiState {
                            Text(message)
                                .foregroundColor(.red)
                                .font(.caption)
                                .padding(.top, 5)
                        }
                        
                        CustomPrimaryButton(
                            title: "Configurer",
                            action: {
                                Task {
                                    await viewModel.configureDevice(
                                        restaurantId: Int(restaurantID) ?? 0,
                                        pinRestaurant: pinRestaurant
                                    )
                                }
                            },
                            isActive: isFormValid
                        )
                    }
                }
                
                Spacer()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(ColorConstants.backgroundWhite)
            .ignoresSafeArea()
            .padding()
            
            if case .loading = viewModel.uiState {
                CustomLoader()
            }
        }
        .onChange(of: viewModel.uiState) { state in
            if case .success = state {
                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                    onDeviceConfigured()
                }
            }
        }
    }
    
    private var isFormValid: Bool {
        !restaurantID.isEmpty && pinRestaurant.count == 6
    }
}

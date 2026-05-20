import SwiftUI

struct ReservationFormSheet: View {

    @ObservedObject var viewModel: ReservationViewModel
    var onDone: () -> Void

    var body: some View {
        NavigationView {
            Form {

                Section("Client") {
                    TextField("Nom du client", text: $viewModel.clientName)

                    HStack {
                        TextField("Téléphone", text: $viewModel.phoneNumber)
                            .keyboardType(.phonePad)

                        if DeviceHelper.hasSIMCard && !viewModel.phoneNumber.isEmpty {
                            Button {
                                let cleaned = viewModel.phoneNumber.filter { $0.isNumber || $0 == "+" }
                                if let url = URL(string: "tel://\(cleaned)") {
                                    UIApplication.shared.open(url)
                                }
                            } label: {
                                Label("Appeler", systemImage: "phone.fill")
                                    .font(.caption)
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(Color.green)
                                    .cornerRadius(8)
                            }
                        }
                    }

                    Stepper(
                        "Personnes : \(viewModel.partySize)",
                        value: $viewModel.partySize,
                        in: 1...50
                    )
                }

                Section("Date & Heure") {
                    DatePicker(
                        "Réservation",
                        selection: $viewModel.datetime,
                        displayedComponents: [.date, .hourAndMinute]
                    )
                    .datePickerStyle(.compact)
                    .environment(\.locale, Locale(identifier: "fr_FR"))
                }
                
                Section("Préférences client") {

                    TextField("Note du serveur", text: $viewModel.serverNote)

                    TextField("Note du restaurant", text: $viewModel.restaurantNote)

                    TextField("Allergies", text: $viewModel.allergies)
                }

                Section("Salle") {
                    Picker("Salle", selection: $viewModel.salleId) {
                        ForEach(viewModel.salles) { salle in
                            Text(salle.name).tag(salle.id)
                        }
                    }
                }

                if case .error(let msg) = viewModel.formUiState {
                    Section {
                        Text(msg)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }


                Section {
                    if viewModel.isEditMode {

                        CustomSecondaryButton(
                            title: "Annuler la réservation",
                            action: {
                                Task { await viewModel.delete() }
                            }
                        )
                        .frame(maxWidth: .infinity)
                        .listRowBackground(Color.clear)
                        .listRowInsets(EdgeInsets())

                        CustomPrimaryButton(
                            title: "Modifier l'affectation de table",
                            action: {

                            },
                            isActive: viewModel.isFormValid
                        )
                        .frame(maxWidth: .infinity)
                        .listRowBackground(Color.clear)
                        .listRowInsets(EdgeInsets())

                    } else {

                        CustomPrimaryButton(
                            title: "Affecter la table",
                            action: {

                            },
                            isActive: viewModel.isFormValid
                        )
                        .frame(maxWidth: .infinity)
                        .listRowBackground(Color.clear)
                        .listRowInsets(EdgeInsets())
                    }
                }
            }
            .navigationTitle(viewModel.isEditMode ? "Modifier" : "Nouvelle réservation")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") { viewModel.showSheet = false }
                }
                ToolbarItem(placement: .confirmationAction) {
                    if case .loading = viewModel.formUiState {
                        ProgressView()
                    } else {
                        Button("Enregistrer") {
                            Task { await viewModel.save() }
                        }
                        .disabled(!viewModel.isFormValid)
                    }
                }
            }
        }
        .onChange(of: viewModel.formUiState) { state in
            switch state {
            case .success, .deleted:
                onDone()
            default:
                break
            }
        }
    }
}

import SwiftUI

struct ReservationFormSheet: View {

    @ObservedObject var viewModel: ReservationViewModel
    var onDone: () -> Void  // reload après save ou delete

    var body: some View {
        NavigationView {
            Form {

                // MARK: - Client
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

                // MARK: - Date
                Section("Date & Heure") {
                    DatePicker(
                        "Réservation",
                        selection: $viewModel.datetime,
                        displayedComponents: [.date, .hourAndMinute]
                    )
                    .datePickerStyle(.compact)
                    .environment(\.locale, Locale(identifier: "fr_FR"))
                }

                // MARK: - Salle
                Section("Salle") {
                    Picker("Salle", selection: $viewModel.salleId) {
                        ForEach(viewModel.salles) { salle in
                            Text(salle.name).tag(salle.id)
                        }
                    }
                }

                // MARK: - Erreur
                if case .error(let msg) = viewModel.formUiState {
                    Section {
                        Text(msg)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }

                // MARK: - Supprimer (edit uniquement)
                if viewModel.isEditMode {
                    Section {
                        Button(role: .destructive) {
                            Task { await viewModel.delete() }
                        } label: {
                            HStack {
                                Spacer()
                                Text("Supprimer la réservation")
                                Spacer()
                            }
                        }
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

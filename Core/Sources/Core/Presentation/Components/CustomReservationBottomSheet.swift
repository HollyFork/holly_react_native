// Presentation/Views/CustomReservationBottomSheet.swift
import SwiftUI

/*
struct CustomReservationBottomSheet: View {

    let reservation: Reservation
    var onDismiss: (() -> Void)? = nil
    var onUpdated: ((Reservation) -> Void)? = nil

    @Environment(\.dismiss) private var dismiss

    // Champs éditables
    @State private var clientName: String
    @State private var numberOfPeople: String
    @State private var dateTime: Date
    @State private var phone: String
    @State private var author: String
    @State private var clientNote: String
    @State private var reservationNote: String
    @State private var allergies: String
    @State private var mealDuration: String

    // UI state
    @State private var isLoading = false
    @State private var errorMessage: String? = nil
    @State private var showDatePicker = false

    private let updateUseCase: UpdateReservationUseCase = UpdateReservationUseCaseImpl(
        repository: ReservationRepositoryImpl(
            remoteDataSource: ReservationRemoteDataSourceImpl()
        )
    )

    init(reservation: Reservation,
         onDismiss: (() -> Void)? = nil,
         onUpdated: ((Reservation) -> Void)? = nil) {
        self.reservation = reservation
        self.onDismiss = onDismiss
        self.onUpdated = onUpdated

        _clientName      = State(initialValue: reservation.clientName)
        _numberOfPeople  = State(initialValue: "\(reservation.numberOfPeople)")
        _dateTime        = State(initialValue: reservation.dateTime)
        _phone           = State(initialValue: reservation.phone)
        _author          = State(initialValue: reservation.author ?? "")
        _clientNote      = State(initialValue: reservation.clientNote ?? "")
        _reservationNote = State(initialValue: reservation.reservationNote ?? "")
        _allergies       = State(initialValue: reservation.allergies ?? "")
        _mealDuration    = State(initialValue: reservation.mealDuration ?? "")
    }

    var body: some View {
        NavigationView {
            ZStack {
                Color(UIColor.systemGroupedBackground).ignoresSafeArea()

                VStack(spacing: 0) {
                    // Header
                    header

                    ScrollView {
                        VStack(spacing: 16) {
                            // Section : Infos principales
                            sectionCard(title: "INFORMATIONS PRINCIPALES") {
                                reservationField(
                                    icon: "person.fill",
                                    label: "Nom du client",
                                    binding: $clientName
                                )
                                Divider().padding(.leading, 44)

                                reservationField(
                                    icon: "person.2.fill",
                                    label: "Nombre de personnes",
                                    binding: $numberOfPeople,
                                    keyboardType: .numberPad
                                )
                                Divider().padding(.leading, 44)

                                dateField(
                                    icon: "calendar",
                                    label: "Date / Heure",
                                    date: $dateTime
                                )
                                Divider().padding(.leading, 44)

                                reservationField(
                                    icon: "phone.fill",
                                    label: "Téléphone",
                                    binding: $phone,
                                    keyboardType: .phonePad
                                )
                            }

                            // Section : Informations réservation
                            sectionCard(title: "INFORMATIONS RÉSERVATION") {

                                reservationNoteField(
                                    icon: "note.text",
                                    label: "Note sur le client",
                                    binding: $clientNote
                                )

                                if reservation.allergies != nil || true {
                                    Divider().padding(.leading, 44)
                                    reservationNoteField(
                                        icon: "allergens",
                                        label: "Allergies",
                                        binding: $allergies,
                                        sfSymbol: true
                                    )
                                }

                                Divider().padding(.leading, 44)
                                reservationNoteField(
                                    icon: "square.and.pencil",
                                    label: "Note sur la réservation",
                                    binding: $reservationNote
                                )

                                if let source = reservation.source, !source.isEmpty {
                                    Divider().padding(.leading, 44)
                                    readonlyField(
                                        icon: "phone.arrow.up.right",
                                        label: "Source",
                                        value: source
                                    )
                                }

                                Divider().padding(.leading, 44)
                                reservationField(
                                    icon: "pencil",
                                    label: "Prise par",
                                    binding: $author
                                )

                                Divider().padding(.leading, 44)
                                reservationField(
                                    icon: "timer",
                                    label: "Durée du repas",
                                    binding: $mealDuration,
                                    placeholder: "ex: 01:30"
                                )

                                if let updatedAt = reservation.updatedAt {
                                    Divider().padding(.leading, 44)
                                    readonlyField(
                                        icon: "arrow.clockwise",
                                        label: "Date de mise à jour",
                                        value: formatDateTime(updatedAt)
                                    )
                                }

                                if let createdAt = reservation.createdAt {
                                    Divider().padding(.leading, 44)
                                    readonlyField(
                                        icon: "calendar.badge.plus",
                                        label: "Date de création",
                                        value: formatDateTime(createdAt)
                                    )
                                }
                            }

                            // Salle (readonly)
                            sectionCard(title: "SALLE") {
                                readonlyField(
                                    icon: "building.2.fill",
                                    label: "Salle",
                                    value: reservation.roomName
                                )
                            }

                            if let err = errorMessage {
                                Text(err)
                                    .foregroundColor(.red)
                                    .font(.system(size: 13))
                                    .padding(.horizontal)
                            }

                            Spacer(minLength: 20)
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 12)
                        .padding(.bottom, 100) // espace pour les boutons fixes
                    }

                    // Boutons fixes en bas
                    bottomButtons
                }
            }
            .navigationBarHidden(true)
            .overlay {
                if isLoading { CustomLoader() }
            }
        }
    }

    // MARK: - Header
    private var header: some View {
        ZStack {
            Color(UIColor.systemBackground)
            HStack {
                Button {
                    onDismiss?()
                    dismiss()
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.primary)
                }
                Spacer()
                Text("RÉSERVATION")
                    .font(.system(size: 17, weight: .bold))
                Spacer()
                // Équilibre visuel
                Image(systemName: "chevron.left").opacity(0)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 14)
        }
        .frame(height: 52)
        .shadow(color: Color.black.opacity(0.05), radius: 4, y: 2)
    }

    // MARK: - Bottom buttons
    private var bottomButtons: some View {
        VStack(spacing: 0) {
            Divider()
            VStack(spacing: 10) {
                Button(action: saveReservation) {
                    HStack {
                        if isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .scaleEffect(0.8)
                        }
                        Text("Modifier la réservation")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(ColorConstants.primaryOrange)
                    .cornerRadius(12)
                }
                .disabled(isLoading)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(Color(UIColor.systemBackground))
        }
    }

    // MARK: - Reusable row: editable field
    private func reservationField(
        icon: String,
        label: String,
        binding: Binding<String>,
        placeholder: String = "",
        keyboardType: UIKeyboardType = .default
    ) -> some View {
        HStack(alignment: .center, spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(Color(UIColor.secondaryLabel))
                .frame(width: 28)

            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(Color(UIColor.secondaryLabel))
                    .textCase(.uppercase)
                TextField(placeholder.isEmpty ? label : placeholder, text: binding)
                    .font(.system(size: 15))
                    .keyboardType(keyboardType)
            }
        }
        .padding(.vertical, 10)
        .padding(.horizontal, 16)
    }

    // MARK: - Multiline note field
    private func reservationNoteField(
        icon: String,
        label: String,
        binding: Binding<String>,
        sfSymbol: Bool = true
    ) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Group {
                if sfSymbol {
                    Image(systemName: icon)
                        .font(.system(size: 16))
                } else {
                    Image(systemName: icon)
                        .font(.system(size: 16))
                }
            }
            .foregroundColor(Color(UIColor.secondaryLabel))
            .frame(width: 28)
            .padding(.top, 12)

            VStack(alignment: .leading, spacing: 4) {
                Text(label)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(Color(UIColor.secondaryLabel))
                    .textCase(.uppercase)
                    .padding(.top, 10)

                ZStack(alignment: .topLeading) {
                    if binding.wrappedValue.isEmpty {
                        Text("Appuyer pour ajouter…")
                            .foregroundColor(Color(UIColor.placeholderText))
                            .font(.system(size: 15))
                            .padding(.top, 4)
                    }
                    TextEditor(text: binding)
                        .font(.system(size: 15))
                        .frame(minHeight: 60)
                        .background(Color.clear)
                }
            }
        }
        .padding(.vertical, 6)
        .padding(.horizontal, 16)
    }

    // MARK: - Date picker field
    private func dateField(icon: String, label: String, date: Binding<Date>) -> some View {
        HStack(alignment: .center, spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(Color(UIColor.secondaryLabel))
                .frame(width: 28)

            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(Color(UIColor.secondaryLabel))
                    .textCase(.uppercase)
                DatePicker("", selection: date, displayedComponents: [.date, .hourAndMinute])
                    .labelsHidden()
                    .font(.system(size: 15))
            }
        }
        .padding(.vertical, 10)
        .padding(.horizontal, 16)
    }

    // MARK: - Readonly field
    private func readonlyField(icon: String, label: String, value: String) -> some View {
        HStack(alignment: .center, spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(Color(UIColor.secondaryLabel))
                .frame(width: 28)

            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(Color(UIColor.secondaryLabel))
                    .textCase(.uppercase)
                Text(value)
                    .font(.system(size: 15))
                    .foregroundColor(.primary)
            }
            Spacer()
        }
        .padding(.vertical, 10)
        .padding(.horizontal, 16)
    }

    // MARK: - Section card container
    @ViewBuilder
    private func sectionCard<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(title)
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(Color(UIColor.secondaryLabel))
                .padding(.horizontal, 16)
                .padding(.bottom, 6)

            VStack(spacing: 0) {
                content()
            }
            .background(Color(UIColor.systemBackground))
            .cornerRadius(12)
        }
    }

    // MARK: - Save
    private func saveReservation() {
        guard let people = Int(numberOfPeople), people > 0 else {
            errorMessage = "Le nombre de personnes doit être un entier positif."
            return
        }
        guard !clientName.trimmingCharacters(in: .whitespaces).isEmpty else {
            errorMessage = "Le nom du client est obligatoire."
            return
        }
        errorMessage = nil
        isLoading = true

        let body = ReservationUpdateRequest(
            clientName: clientName.trimmingCharacters(in: .whitespaces),
            numberOfPeople: people,
            dateTime: dateTime,
            phone: phone.trimmingCharacters(in: .whitespaces),
            author: author.isEmpty ? nil : author,
            clientNote: clientNote.isEmpty ? nil : clientNote,
            reservationNote: reservationNote.isEmpty ? nil : reservationNote,
            allergies: allergies.isEmpty ? nil : allergies,
            mealDuration: mealDuration.isEmpty ? nil : mealDuration
        )

        Task {
            do {
                let updated = try await updateUseCase.execute(id: reservation.id, body: body)
                await MainActor.run {
                    isLoading = false
                    onUpdated?(updated)
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = error.localizedDescription
                }
            }
        }
    }

    // MARK: - Helpers
    private func formatDateTime(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "dd/MM/yyyy HH:mm:ss"
        return f.string(from: date)
    }
}


*/

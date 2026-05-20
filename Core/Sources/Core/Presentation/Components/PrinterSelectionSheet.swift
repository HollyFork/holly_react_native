import SwiftUI

struct PrinterSelectionSheet: View {

    @Binding var selectedPrinter: String
    var onConfirm: () -> Void
    @Environment(\.dismiss) var dismiss

    let printers = [
        "1 - Cuisine",
        "2 - Terrasse",
        "3 - Bar",
        "4 - Salle principale",
        "5 - Cuisine froide"
    ]

    var body: some View {
        NavigationView {
            Form {

                Section("Sélectionner une imprimante") {
                    ForEach(printers, id: \.self) { printer in
                        HStack {
                            Text(printer)

                            Spacer()

                            if selectedPrinter == printer {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(ColorConstants.primaryOrange)
                            }
                        }
                        .contentShape(Rectangle())
                        .onTapGesture {
                            selectedPrinter = printer
                        }
                    }
                }
            }
            .navigationTitle("Imprimantes")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Fermer") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("OK") {
                        onConfirm()
                        dismiss()
                    }
                }
            }
        }
    }
}

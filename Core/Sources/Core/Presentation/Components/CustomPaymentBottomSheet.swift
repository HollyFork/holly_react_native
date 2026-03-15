import SwiftUI

// ✅ Struct Identifiable pour le sheet
struct ReceiptSheetData: Identifiable {
    let id = UUID()
    let data: Data?
    let tableNumber: String
}

struct Payment: Identifiable {
    let id = UUID()
    let method: String
    let amount: Double
}

struct CustomPaymentBottomSheet: View {
    
    let tableNumber: String
    let orderItems: [OrderItem]
    
    @State private var showPaymentInput = false
    @State private var selectedPaymentMethod = ""
    @State private var payments: [Payment] = []
    @State private var receiptSheetData: ReceiptSheetData? = nil  // ✅ CORRIGÉ
    
    @Environment(\.dismiss) var dismiss

    // ── Calculs ─────────────────
    var grandTotal: Double {
        orderItems.reduce(0) { $0 + $1.totalPrice }
    }

    var totalPaid: Double {
        payments.reduce(0) { $0 + $1.amount }
    }

    var totalRemaining: Double {
        max(0, grandTotal - totalPaid)
    }

    var receiptItems: [ReceiptItem] {
        orderItems.map { item in
            let cleanedPrice = item.article.price
                .replacingOccurrences(of: ",", with: ".")
                .trimmingCharacters(in: CharacterSet(charactersIn: "."))

            return ReceiptItem(
                name: item.article.name,
                quantity: item.quantity,
                price: Double(cleanedPrice) ?? 0,
                category: item.article.categoryName,
                menu: nil
            )
        }
    }

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Header
                HStack {
                    Text("Table \(tableNumber)")
                        .font(.system(size: 28, weight: .bold))
                    Spacer()
                    Button { dismiss() } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 28))
                            .foregroundColor(.gray)
                    }
                }
                .padding()

                ScrollView {
                    VStack(spacing: 16) {
                        // Résumé commande (inchangé)
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Résumé de la commande")
                                .font(.system(size: 22, weight: .semibold))
                            Divider()
                            
                            if orderItems.isEmpty {
                                Text("Aucun article commandé")
                                    .foregroundColor(.gray)
                                    .font(.system(size: 16))
                                    .padding(.vertical, 8)
                            } else {
                                let grouped = Dictionary(grouping: orderItems) {
                                    $0.article.categoryName
                                }
                                ForEach(grouped.keys.sorted(), id: \.self) { category in
                                    Text(category)
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(.gray)
                                        .padding(.top, 4)
                                    ForEach(grouped[category] ?? []) { item in
                                        HStack {
                                            Text("\(item.quantity)x")
                                                .font(.system(size: 16, weight: .semibold))
                                                .frame(width: 40, alignment: .leading)
                                            Text(item.article.name)
                                                .font(.system(size: 16))
                                            Spacer()
                                            Text(String(format: "%.2f €", item.totalPrice))
                                                .font(.system(size: 16, weight: .semibold))
                                        }
                                        .padding(.vertical, 2)
                                    }
                                }
                            }

                            Divider()
                            HStack {
                                Text("Total")
                                    .font(.system(size: 20, weight: .bold))
                                    .foregroundColor(ColorConstants.primaryOrange)
                                Spacer()
                                Text(String(format: "%.2f €", grandTotal))
                                    .font(.system(size: 24, weight: .bold))
                                    .foregroundColor(ColorConstants.primaryOrange)
                            }
                            Divider()
                            HStack {
                                Text("Total restant")
                                    .font(.system(size: 20, weight: .bold))
                                Spacer()
                                Text(String(format: "%.2f €", totalRemaining))
                                    .font(.system(size: 24, weight: .bold))
                                    .foregroundColor(totalRemaining > 0 ? .orange : .green)
                            }

                            if !payments.isEmpty {
                                Divider()
                                VStack(alignment: .leading, spacing: 6) {
                                    Text("Paiements effectués :")
                                        .font(.system(size: 16, weight: .semibold))
                                        .padding(.bottom, 4)
                                    ForEach(payments) { payment in
                                        HStack {
                                            Text(payment.method)
                                                .font(.system(size: 16))
                                                .foregroundColor(.gray)
                                            Spacer()
                                            Text(String(format: "%.2f €", payment.amount))
                                                .font(.system(size: 16, weight: .medium))
                                                .foregroundColor(.gray)
                                        }
                                    }
                                    Divider().padding(.vertical, 4)
                                    HStack {
                                        Text("Total payé")
                                            .font(.system(size: 16, weight: .semibold))
                                        Spacer()
                                        Text(String(format: "%.2f €", totalPaid))
                                            .font(.system(size: 16, weight: .bold))
                                            .foregroundColor(.green)
                                    }
                                }
                            }
                        }
                        .padding()
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(12)

                        // Méthodes de paiement
                        VStack(spacing: 12) {
                            HStack {
                                Text("Méthode de paiement")
                                    .font(.system(size: 22, weight: .semibold))
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                Spacer()
                                
                                // ✅ CORRIGÉ : Utilise ReceiptSheetData
                                Button {
                                    let generator = ReceiptPDFGenerator()
                                    let pdfData = generator.generateReceiptPDF(
                                        items: receiptItems,
                                        total: grandTotal,
                                        mode: .category
                                    )
                                    receiptSheetData = ReceiptSheetData(data: pdfData, tableNumber: tableNumber)
                                } label: {
                                    HStack {
                                        Image("ic_receipt")
                                            .resizable()
                                            .aspectRatio(contentMode: .fit)
                                            .frame(width: 24, height: 24)
                                        Text("Ticket")
                                            .font(.system(size: 18, weight: .medium))
                                            .foregroundColor(ColorConstants.backgroundWhite)
                                    }
                                    .padding()
                                    .background(ColorConstants.primaryOrange)
                                    .cornerRadius(12)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                                    )
                                }
                            }

                            CustomPaymentButton(icon: "ic_payment_credit_card", title: "Carte bancaire") {
                                selectedPaymentMethod = "Carte bancaire"
                                showPaymentInput = true
                            }
                            CustomPaymentButton(icon: "ic_payment_cash", title: "Espèces") {
                                selectedPaymentMethod = "Espèces"
                                showPaymentInput = true
                            }
                            CustomPaymentButton(icon: "ic_payment_ticket", title: "Ticket Restaurant") {
                                selectedPaymentMethod = "Ticket Restaurant"
                                showPaymentInput = true
                            }
                            CustomPaymentButton(icon: "ic_payment_gift", title: "Avoir") {
                                selectedPaymentMethod = "Avoir"
                                showPaymentInput = true
                            }
                            CustomPaymentButton(icon: "ic_payment_cheque", title: "Chèque de banque") {
                                selectedPaymentMethod = "Chèque"
                                showPaymentInput = true
                            }
                        }

                        Spacer(minLength: 40)
                    }
                    .padding()
                }
            }
            .background(Color(UIColor.systemGroupedBackground))
        }
        .sheet(isPresented: $showPaymentInput) {
            PaymentInputView(
                tableNumber: tableNumber,
                totalRemaining: totalRemaining,
                onAmountEntered: { amount in
                    payments.append(Payment(method: selectedPaymentMethod, amount: amount))
                }
            )
        }
        // ✅ Sheet avec Identifiable struct
        .sheet(item: $receiptSheetData) { receipt in
            NavigationView {
                if let data = receipt.data {
                    PDFDataView(data: data)
                        .navigationTitle("Ticket Table \(receipt.tableNumber)")
                        .navigationBarTitleDisplayMode(.inline)
                        .toolbar {
                            ToolbarItem(placement: .cancellationAction) {
                                Button("Fermer") { receiptSheetData = nil }
                            }
                            ToolbarItem(placement: .confirmationAction) {
                                Button("Envoyer") { receiptSheetData = nil }
                            }
                        }
                } else {
                    Text("Erreur génération PDF")
                        .padding()
                }
            }
            .presentationDetents([.medium, .large])
            .presentationDragIndicator(.visible)
        }
    }
}

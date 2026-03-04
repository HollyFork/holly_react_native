import SwiftUI


struct CustomPaymentBottomSheet: View {

    @State private var showPaymentInput = false
    @State private var selectedPaymentMethod = ""
    @State private var totalRemaining: Double = 180.50
    @State private var payments: [Payment] = []

    @State private var showReceipt = false
    @State private var receiptPDFData: Data?


    
    let tableNumber: String
    @Environment(\.dismiss) private var dismiss

    var totalPaid: Double {
        payments.reduce(0) { $0 + $1.amount }
    }

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                header
                ScrollView {
                    VStack(spacing: 16) {
                        orderSummary
                        paymentSection
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
                totalRemaining: totalRemaining
            ) { amount in
                payments.append(
                    Payment(method: selectedPaymentMethod, amount: amount)
                )
                totalRemaining -= amount
            }
        }
        
        .sheet(isPresented: $showReceipt) {
            NavigationView {
                if let data = receiptPDFData {
                    PDFDataView(data: data)
                        .navigationTitle("Ticket de caisse")
                        .navigationBarTitleDisplayMode(.inline)
                        .toolbar {
                            ToolbarItem(placement: .cancellationAction) {
                                Button("Fermer") {
                                    showReceipt = false
                                }
                            }
                        }
                }
            }
            .presentationDetents([.medium, .large])
        }


    }

    private var header: some View {
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
    }

    private var orderSummary: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Résumé de la commande")
                .font(.system(size: 22, weight: .semibold))

            Divider()

            ForEach(items, id: \.name) { item in
                HStack {
                    Text("\(item.quantity)x")
                        .frame(width: 40, alignment: .leading)
                        .font(.system(size: 16, weight: .semibold))
                    Text(item.name)
                        .font(.system(size: 16))
                    Spacer()
                    Text(String(format: "%.2f €", item.price * Double(item.quantity)))
                        .font(.system(size: 16, weight: .semibold))
                }
            }

            Divider()

            HStack {
                Text("Total")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(ColorConstants.primaryOrange)
                Spacer()
                Text("180,50 €")
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
                    ForEach(payments) { payment in
                        HStack {
                            Text(payment.method)
                                .foregroundColor(.gray)
                            Spacer()
                            Text(String(format: "%.2f €", payment.amount))
                                .foregroundColor(.gray)
                        }
                    }
                    Divider()
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
    }

    private var paymentSection: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Méthode de paiement")
                    .font(.system(size: 22, weight: .semibold))
                Spacer()
                Button {
                    generateReceipt()
                } label: {
                    HStack {
                        Image("ic_receipt")
                            .resizable()
                            .frame(width: 24, height: 24)
                        Text("Ticket")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(.white)
                    }
                    .padding()
                    .background(ColorConstants.primaryOrange)
                    .cornerRadius(12)
                }
            }

            paymentButton("Carte bancaire", "ic_payment_credit_card")
            paymentButton("Espèces", "ic_payment_cash")
            paymentButton("Ticket Restaurant", "ic_payment_ticket")
            paymentButton("Avoir", "ic_payment_gift")
            paymentButton("Chèque", "ic_payment_cheque")
        }
    }

    private func paymentButton(_ title: String, _ icon: String) -> some View {
        CustomPaymentButton(icon: icon, title: title) {
            selectedPaymentMethod = title
            showPaymentInput = true
        }
    }

    private func generateReceipt() {
        let total = items.reduce(0) { $0 + ($1.price * Double($1.quantity)) }
        let generator = ReceiptPDFGenerator()

        receiptPDFData = generator.generateReceiptPDF(
            items: items,
            total: total,
            mode: .category
        )

        if receiptPDFData != nil {
            showReceipt = true
        }
    }


    private var items: [ReceiptItem] {
        [
            ReceiptItem(name: "Salade César", quantity: 2, price: 12, category: "Entrée", menu: nil),
            ReceiptItem(name: "Soupe à l'oignon", quantity: 1, price: 8.5, category: "Entrée", menu: nil),
            ReceiptItem(name: "Steak frites", quantity: 2, price: 18, category: "Plat", menu: nil),
            ReceiptItem(name: "Saumon grillé", quantity: 1, price: 22.5, category: "Plat", menu: nil),
            ReceiptItem(name: "Poulet rôti", quantity: 1, price: 16, category: "Plat", menu: nil),
            ReceiptItem(name: "Crème brûlée", quantity: 2, price: 7.5, category: "Dessert", menu: nil),
            ReceiptItem(name: "Tarte Tatin", quantity: 1, price: 8, category: "Dessert", menu: nil),
            ReceiptItem(name: "Coca-Cola", quantity: 3, price: 3.5, category: "Boisson", menu: nil),
            ReceiptItem(name: "Vin rouge (bouteille)", quantity: 1, price: 35, category: "Boisson", menu: nil),
            ReceiptItem(name: "Eau minérale", quantity: 2, price: 2.5, category: "Boisson", menu: nil)
        ]
    }
}

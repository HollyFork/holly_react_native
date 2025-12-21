
import SwiftUI


struct CustomPaymentBottomSheet: View {
    @State private var showPaymentInput = false
    @State private var selectedPaymentMethod: String = ""
    @State private var totalRemaining: Double = 180.50
    @State private var payments: [Payment] = []
    
    
    @State private var showReceiptSheet = false
    @State private var receiptPDFData: Data?

    
    let tableNumber: String
    @Environment(\.dismiss) var dismiss
    
    var totalPaid: Double {
        payments.reduce(0) { $0 + $1.amount }
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                HStack {
                    Text("Table \(tableNumber)")
                        .font(.system(size: 28, weight: .bold))
                    Spacer()
                    Button(action: {
                        dismiss()
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 28))
                            .foregroundColor(.gray)
                    }
                }
                .padding()
                
                ScrollView {
                    VStack(spacing: 16) {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Résumé de la commande")
                                .font(.system(size: 22, weight: .semibold))

                            Divider()

                            let items = [
                                ReceiptItem(name: "Salade César", quantity: 2, price: 12.0, category: "Entrée", menu: nil),
                                ReceiptItem(name: "Soupe à l'oignon", quantity: 1, price: 8.5, category: "Entrée", menu: nil),
                                
                                ReceiptItem(name: "Steak frites", quantity: 2, price: 18.0, category: "Plat", menu: nil),
                                ReceiptItem(name: "Saumon grillé", quantity: 1, price: 22.5, category: "Plat", menu: nil),
                                ReceiptItem(name: "Poulet rôti", quantity: 1, price: 16.0, category: "Plat", menu: nil),
                                
                                ReceiptItem(name: "Crème brûlée", quantity: 2, price: 7.5, category: "Dessert", menu: nil),
                                ReceiptItem(name: "Tarte Tatin", quantity: 1, price: 8.0, category: "Dessert", menu: nil),
                                
                                ReceiptItem(name: "Coca-Cola", quantity: 3, price: 3.5, category: "Boisson", menu: nil),
                                ReceiptItem(name: "Vin rouge (bouteille)", quantity: 1, price: 35.0, category: "Boisson", menu: nil),
                                ReceiptItem(name: "Eau minérale", quantity: 2, price: 2.5, category: "Boisson", menu: nil)
                            ]

                            ForEach(items, id: \.name) { item in
                                HStack {
                                    Text("\(item.quantity)x")
                                        .font(.system(size: 16, weight: .semibold))
                                        .frame(width: 40, alignment: .leading)
                                    
                                    Text(item.name)
                                        .font(.system(size: 16))
                                    
                                    Spacer()
                                    
                                    let totalPrice = item.price * Double(item.quantity)
                                    Text(String(format: "%.2f €", totalPrice))
                                        .font(.system(size: 16, weight: .semibold))
                                }
                                .padding(.vertical, 2)
                            }

                            
                            Divider()
                            
                            // Total
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
                                    
                                    Divider()
                                        .padding(.vertical, 4)
                                    
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
                        
                        VStack(spacing: 12) {
                            
                            HStack {
                        
                                Text("Méthode de paiement")
                                    .font(.system(size: 22, weight: .semibold))
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                
                                Spacer()
                                Button {
                                    let items = [
                                        ReceiptItem(name: "Salade César", quantity: 2, price: 12.0, category: "Entrée", menu: nil),
                                        ReceiptItem(name: "Soupe à l'oignon", quantity: 1, price: 8.5, category: "Entrée", menu: nil),
                                        
                                        ReceiptItem(name: "Steak frites", quantity: 2, price: 18.0, category: "Plat", menu: nil),
                                        ReceiptItem(name: "Saumon grillé", quantity: 1, price: 22.5, category: "Plat", menu: nil),
                                        ReceiptItem(name: "Poulet rôti", quantity: 1, price: 16.0, category: "Plat", menu: nil),
                                        
                                        ReceiptItem(name: "Crème brûlée", quantity: 2, price: 7.5, category: "Dessert", menu: nil),
                                        ReceiptItem(name: "Tarte Tatin", quantity: 1, price: 8.0, category: "Dessert", menu: nil),
                                        
                                        ReceiptItem(name: "Coca-Cola", quantity: 3, price: 3.5, category: "Boisson", menu: nil),
                                        ReceiptItem(name: "Vin rouge (bouteille)", quantity: 1, price: 35.0, category: "Boisson", menu: nil),
                                        ReceiptItem(name: "Eau minérale", quantity: 2, price: 2.5, category: "Boisson", menu: nil)
                                    ]

                                    let total = items.reduce(0) { $0 + ($1.price * Double($1.quantity)) }

                                    let generator = ReceiptPDFGenerator()
                                    let pdfData = generator.generateReceiptPDF(items: items, total: total, mode: .category)

                                    
                                    let sizeInBytes = pdfData.count
                                    let sizeInKB = Double(sizeInBytes) / 1024
                                    let sizeInMB = sizeInKB / 1024

                                    print(String(format: "Taille du PDF : %.2f Ko (%.2f Mo)", sizeInKB, sizeInMB))

                                    receiptPDFData = pdfData
                                    showReceiptSheet = true
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
                                    .foregroundColor(.black)
                                    .cornerRadius(12)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                                    )
                                }
                            }
                            
                            
                            CustomPaymentButton(
                                icon: "ic_payment_credit_card",
                                title: "Carte bancaire"
                            ) {
                                selectedPaymentMethod = "Carte bancaire"
                                showPaymentInput = true
                            }
                            
                            CustomPaymentButton(
                                icon: "ic_payment_cash",
                                title: "Espèces"
                            ) {
                                selectedPaymentMethod = "Espèces"
                                showPaymentInput = true
                            }
                            
                            CustomPaymentButton(
                                icon: "ic_payment_ticket",
                                title: "Ticket Restaurant"
                            ) {
                                selectedPaymentMethod = "Ticket Restaurant"
                                showPaymentInput = true
                            }
                            
                            CustomPaymentButton(
                                icon: "ic_payment_gift",
                                title: "Avoir"
                            ) {
                                selectedPaymentMethod = "Avoir"
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
                    let newPayment = Payment(
                        method: selectedPaymentMethod,
                        amount: amount
                    )
                    payments.append(newPayment)
                    
                    totalRemaining -= amount
                    
                    
                }
            )
        }.sheet(isPresented: $showReceiptSheet) {
            if let data = receiptPDFData {
                NavigationView {
                    PDFDataView(data: data)
                        .navigationTitle("Ticket de caisse")
                        .navigationBarTitleDisplayMode(.inline)
                        .toolbar {
                            ToolbarItem(placement: .cancellationAction) {
                                Button("Fermer") {
                                    showReceiptSheet = false
                                }
                            }

                            ToolbarItem(placement: .confirmationAction) {
                                Button("Envoyer") {
                                    showReceiptSheet = false
                                }
                            }
                        }

                }
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
            } else {
                Text("Aucun ticket disponible")
                    .presentationDetents([.medium])
            }
        }

    }

}

import SwiftUI

public struct TableScreen: View {
    
    let tableNumber: String
    var onBackToMap: () -> Void
    
    @State private var selectedCategory: String? = nil
    @State private var showPaymentSheet = false
    
    let subMenus: [String: [SubMenuItem]] = [
        "Soft": [
            SubMenuItem(name: "Coca", color: .red),
            SubMenuItem(name: "Coca Zéro", color: .green),
            SubMenuItem(name: "Sprite", color: .green),
            SubMenuItem(name: "Fanta Orange", color: .orange),
            SubMenuItem(name: "Fanta Citron", color: .yellow),
            SubMenuItem(name: "Limonade", color: .mint),
            SubMenuItem(name: "CIAO Menthe", color: .cyan),
            SubMenuItem(name: "CIAO Pêche", color: .orange.opacity(0.7)),
            SubMenuItem(name: "CIAO Citron", color: .yellow.opacity(0.8))
        ],
        "Eau": [
            SubMenuItem(name: "Vittel 1L", color: .gray.opacity(0.2)),
            SubMenuItem(name: "SanPé 1L", color: .green.opacity(0.2))
        ]
    ]
    
    public init(tableNumber: String, onBackToMap: @escaping () -> Void = {}) {
        self.tableNumber = tableNumber
        self.onBackToMap = onBackToMap
    }
    
    public var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                
                HStack {
                    Image(systemName: "clock")
                        .foregroundColor(.black)
                    Text("01:14:54")
                        .font(.system(size: 16))
                        .foregroundColor(.black)
                    
                    Spacer()
                    
                    Text("T \(tableNumber)")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.black)
                    
                    Spacer()
                    
                    Image(systemName: "person.2.fill")
                        .foregroundColor(.black)
                    Text("3 pax")
                        .font(.system(size: 16))
                        .foregroundColor(.black)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.white)
                .overlay(Rectangle().stroke(Color.black, lineWidth: 1))
                
                HStack(spacing: 0) {
                    
                    VStack(spacing: 0) {
                        SectionView(title: "Direct")
                        SectionView(title: "À Suivre 1")
                        SectionView(title: "À Suivre 2")

                    }
                    .frame(width: geometry.size.width * 0.33)
                    .background(Color.white)
                    .overlay(Rectangle().stroke(Color.black, lineWidth: 1))
                    
                    Rectangle().fill(Color.black).frame(width: 1)
                    
                    VStack {
                        if let selected = selectedCategory, let items = subMenus[selected] {
                            Text(selected)
                                .font(.system(size: 18, weight: .bold))
                                .padding(.top, 8)
                            
                            ScrollView {
                                LazyVGrid(
                                    columns: [GridItem(
                                        .adaptive(
                                            minimum: 120
                                        ),
                                        spacing: 8
                                    )],
                                    spacing: 8
                                ) {
                                    ForEach(items) { item in
                                        Text(item.name)
                                            .font(
                                                .system(
                                                    size: 16,
                                                    weight: .semibold
                                                )
                                            )
                                            .frame(
                                                maxWidth: .infinity,
                                                minHeight: 50
                                            )
                                            .background(item.color)
                                            .foregroundColor(.black)
                                            .cornerRadius(8)
                                            .overlay(
                                                Rectangle()
                                                    .stroke(
                                                        Color.black,
                                                        lineWidth: 1
                                                    )
                                            )
                                    }
                                }
                                .padding()
                            }
                        } else {
                            Spacer()
                            Text("Zone pour composants")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(.gray)
                            Spacer()
                        }
                    }
                    .frame(width: geometry.size.width * 0.34)
                    .background(Color.white)
                    .overlay(Rectangle().stroke(Color.black, lineWidth: 1))
                    
                    Rectangle().fill(Color.black).frame(width: 1)
                    
                    VStack(spacing: 0) {
                        Text("Menu")
                            .font(.system(size: 22, weight: .bold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(Color.black)
                            .foregroundColor(.white)
                        
                        ScrollView {
                            VStack(spacing: 0) {
                                CustomMenuCategoryButton(
                                    title: "Apéros",
                                    bgColor: Color.gray.opacity(0.3),
                                    txtColor: .black
                                ) {
                                    selectedCategory = nil
                                }
                                CustomMenuCategoryButton(
                                    title: "Soft",
                                    bgColor: .black,
                                    txtColor: .white
                                ) {
                                    selectedCategory = "Soft"
                                }
                                CustomMenuCategoryButton(
                                    title: "Vins",
                                    bgColor: Color(
                                        red: 0.8,
                                        green: 0.3,
                                        blue: 0.8
                                    ),
                                    txtColor: .white
                                ) {
                                    selectedCategory = nil
                                }
                                CustomMenuCategoryButton(
                                    title: "Entrée",
                                    bgColor: .orange,
                                    txtColor: .black
                                ) {
                                    selectedCategory = nil
                                }
                                CustomMenuCategoryButton(
                                    title: "Salades",
                                    bgColor: .green,
                                    txtColor: .black
                                ) {
                                    selectedCategory = nil
                                }
                                CustomMenuCategoryButton(
                                    title: "Viande",
                                    bgColor: Color(
                                        red: 0.6,
                                        green: 0.3,
                                        blue: 0.1
                                    ),
                                    txtColor: .white
                                ) {
                                    selectedCategory = nil
                                }
                                CustomMenuCategoryButton(
                                    title: "Poisson",
                                    bgColor: .cyan,
                                    txtColor: .black
                                ) {
                                    selectedCategory = nil
                                }
                                CustomMenuCategoryButton(
                                    title: "Desserts",
                                    bgColor: Color(
                                        red: 1.0,
                                        green: 0.4,
                                        blue: 0.4
                                    ),
                                    txtColor: .black
                                ) {
                                    selectedCategory = nil
                                }
                                CustomMenuCategoryButton(
                                    title: "Digestifs",
                                    bgColor: .purple,
                                    txtColor: .white
                                ) {
                                    selectedCategory = nil
                                }
                                CustomMenuCategoryButton(
                                    title: "Offerts",
                                    bgColor: Color.purple.opacity(0.7),
                                    txtColor: .white
                                ) {
                                    selectedCategory = nil
                                }
                            }
                            Button(action: {
                                showPaymentSheet = true
                            }) {
                                HStack(spacing: 8) {
                                    Image("ic_payment_check_point")
                                        .resizable()
                                        .scaledToFit()
                                        .frame(width: 24, height: 24)
                                    Text("Payer")
                                        .font(.system(size: 18, weight: .semibold))
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(ColorConstants.primaryOrange)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(ColorConstants.primaryOrange, lineWidth: 1)
                                )
                            }
                        }

                       

                    }
                    .frame(width: geometry.size.width * 0.33)
                    .background(Color.white)
                    .overlay(Rectangle().stroke(Color.black, lineWidth: 1))
                }
            }
        }
        .background(Color.white)
        .sheet(isPresented: $showPaymentSheet) {
            CustomPaymentBottomSheet(tableNumber: tableNumber)
        }
    }
}


struct SectionView: View {
    let title: String
    
    var body: some View {
        VStack(spacing: 0) {
            Text(title)
                .font(.system(size: 18, weight: .semibold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
                .background(Color.gray.opacity(0.2))
                .overlay(Rectangle().stroke(Color.black, lineWidth: 1))
            
            Rectangle()
                .fill(Color.white)
                .frame(height: 80)
                .overlay(Rectangle().stroke(Color.black, lineWidth: 1))
        }
    }
}

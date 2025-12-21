import UIKit
import PDFKit

/*
 struct ReceiptItem {
 let name: String
 let quantity: Int
 let price: Double
 }
 
 
 class ReceiptPDFGenerator {
 
 func generateReceiptPDF(items: [ReceiptItem],
 total: Double) -> Data {
 let pageWidth: CGFloat = 300
 let pageHeight: CGFloat = 600
 let pageRect = CGRect(x: 0, y: 0, width: pageWidth, height: pageHeight)
 
 let renderer = UIGraphicsPDFRenderer(bounds: pageRect)
 
 let data = renderer.pdfData { context in
 context.beginPage()
 let ctx = UIGraphicsGetCurrentContext()!
 
 var currentY: CGFloat = 20
 
 // Logo au centre (AppIcon)
 if let icon = Bundle.main.icon { // extension ci‑dessous
 let iconSize: CGFloat = 60
 let iconX = (pageWidth - iconSize) / 2
 let iconRect = CGRect(x: iconX, y: currentY, width: iconSize, height: iconSize)
 icon.draw(in: iconRect)
 currentY += iconSize + 10
 }
 
 // Nom de l'appli
 drawCentered(text: "******",
 y: &currentY,
 pageWidth: pageWidth,
 font: .systemFont(ofSize: 12))
 drawCentered(text: "REÇU DE CAISSE",
 y: &currentY,
 pageWidth: pageWidth,
 font: .boldSystemFont(ofSize: 14))
 drawCentered(text: "******",
 y: &currentY,
 pageWidth: pageWidth,
 font: .systemFont(ofSize: 12))
 drawCentered(text: "REÇU DE CAISSE",
 y: &currentY,
 pageWidth: pageWidth,
 font: .boldSystemFont(ofSize: 14))
 
 currentY += 10
 
 // Ligne de séparation
 drawCentered(text: "------------------------------",
 y: &currentY,
 pageWidth: pageWidth,
 font: .systemFont(ofSize: 10))
 currentY += 5
 
 // Liste des produits
 for item in items {
 let line = "\(item.quantity)x \(item.name)"
 let price = String(format: "%.2f €", item.price)
 
 drawLeftRightLine(left: line,
 right: price,
 y: &currentY,
 pageWidth: pageWidth,
 font: .systemFont(ofSize: 10))
 }
 
 currentY += 5
 drawCentered(text: "------------------------------",
 y: &currentY,
 pageWidth: pageWidth,
 font: .systemFont(ofSize: 10))
 currentY += 5
 
 // Total
 let totalText = String(format: "TOTAL: %.2f €", total)
 drawCentered(text: totalText,
 y: &currentY,
 pageWidth: pageWidth,
 font: .boldSystemFont(ofSize: 12))
 
 currentY += 10
 drawCentered(text: "Merci et à bientôt",
 y: &currentY,
 pageWidth: pageWidth,
 font: .systemFont(ofSize: 10))
 }
 
 return data
 }
 
 // Helpers dessin texte
 private func drawCentered(text: String,
 y: inout CGFloat,
 pageWidth: CGFloat,
 font: UIFont) {
 let attributes: [NSAttributedString.Key: Any] = [
 .font: font
 ]
 let size = text.size(withAttributes: attributes)
 let x = (pageWidth - size.width) / 2.0
 text.draw(at: CGPoint(x: x, y: y), withAttributes: attributes)
 y += size.height + 2
 }
 
 private func drawLeftRightLine(left: String,
 right: String,
 y: inout CGFloat,
 pageWidth: CGFloat,
 font: UIFont) {
 let attributes: [NSAttributedString.Key: Any] = [
 .font: font
 ]
 let leftPoint = CGPoint(x: 10, y: y)
 left.draw(at: leftPoint, withAttributes: attributes)
 
 let rightSize = right.size(withAttributes: attributes)
 let rightX = pageWidth - rightSize.width - 10
 let rightPoint = CGPoint(x: rightX, y: y)
 right.draw(at: rightPoint, withAttributes: attributes)
 
 y += max(left.size(withAttributes: attributes).height,
 rightSize.height) + 2
 }
 }
 
 
 import UIKit
 
 extension Bundle {
 var icon: UIImage? {
 if let icons = infoDictionary?["CFBundleIcons"] as? [String: Any],
 let primary = icons["CFBundlePrimaryIcon"] as? [String: Any],
 let files = primary["CFBundleIconFiles"] as? [String],
 let iconName = files.last {
 return UIImage(named: iconName)
 }
 return nil
 }
 }
 */



/************************************
import UIKit
import PDFKit

struct ReceiptItem {
    let name: String
    let quantity: Int
    let price: Double
}

extension Bundle {
    var icon: UIImage? {
        if let icons = infoDictionary?["CFBundleIcons"] as? [String: Any],
           let primary = icons["CFBundlePrimaryIcon"] as? [String: Any],
           let files = primary["CFBundleIconFiles"] as? [String],
           let iconName = files.last {
            return UIImage(named: iconName)
        }
        return nil
    }
}

class ReceiptPDFGenerator {
    
    func generateReceiptPDF(items: [ReceiptItem],
                           total: Double) -> Data {
        let pageWidth: CGFloat = 300
        let pageHeight: CGFloat = 600
        let pageRect = CGRect(x: 0, y: 0, width: pageWidth, height: pageHeight)
        
        let renderer = UIGraphicsPDFRenderer(bounds: pageRect)
        
        let data = renderer.pdfData { context in
            context.beginPage()
            let ctx = UIGraphicsGetCurrentContext()!
            
            var currentY: CGFloat = 20
            
            // Logo au centre (AppIcon)
            if let qrImage = UIImage(named:"ic_holly_fork_whithout_bg") {
                let qrSize: CGFloat = 80
                let qrX = (pageWidth - qrSize) / 2
                let qrRect = CGRect(x: qrX, y: currentY + 10, width: qrSize, height: qrSize)
                qrImage.draw(in: qrRect)
                currentY += qrSize + 20   // on avance le curseur sous le QR code
            } else {
                // Optionnel: laisser un peu d'espace si l'image n'est pas trouvée
                currentY += 20
            }
            
            // Nom de l'appli - CORRIGÉ : suppression du doublon
            drawCentered(text: "******",
                        y: &currentY,
                        pageWidth: pageWidth,
                        font: .systemFont(ofSize: 12))
            drawCentered(text: "REÇU DE CAISSE",
                        y: &currentY,
                        pageWidth: pageWidth,
                        font: .boldSystemFont(ofSize: 14))
            drawCentered(text: "******",
                        y: &currentY,
                        pageWidth: pageWidth,
                        font: .systemFont(ofSize: 12))
            
            currentY += 10
            
            
            
            // Ligne de séparation
            drawCentered(text: "------------------------------",
                        y: &currentY,
                        pageWidth: pageWidth,
                        font: .systemFont(ofSize: 10))
            currentY += 5
            
            // Date + ID Ticket (avant la liste)
            let headerFont = UIFont.systemFont(ofSize: 9)

            let dateText = formattedDateWithMilliseconds()
            let ticketID = "ID: \(generateTicketID())"

            // Date à gauche
            dateText.draw(
                at: CGPoint(x: 10, y: currentY),
                withAttributes: [.font: headerFont]
            )

            // ID ticket à droite
            let idSize = ticketID.size(withAttributes: [.font: headerFont])
            ticketID.draw(
                at: CGPoint(x: pageWidth - idSize.width - 10, y: currentY),
                withAttributes: [.font: headerFont]
            )

            // Espace sous la ligne
            currentY += max(
                dateText.size(withAttributes: [.font: headerFont]).height,
                idSize.height
            ) + 8

            // Séparateur
            drawCentered(text: "------------------------------",
                         y: &currentY,
                         pageWidth: pageWidth,
                         font: .systemFont(ofSize: 10))
            currentY += 5

            // Liste des produits
            for item in items {
                let line = "\(item.quantity)x \(item.name)"
                let lineTotal = item.price * Double(item.quantity)
                let priceText = String(format: "%.2f €", lineTotal)
                
                // Ligne principale (nom + total)
                drawLeftRightLine(left: line,
                                  right: priceText,
                                  y: &currentY,
                                  pageWidth: pageWidth,
                                  font: .systemFont(ofSize: 10))
                
                // Si quantité > 1, afficher prix unitaire dessous
                if item.quantity > 1 {
                    let unitPriceText = String(format: "%.2f € x %d", item.price, item.quantity)
                    drawCentered(text: unitPriceText,
                                 y: &currentY,
                                 pageWidth: pageWidth,
                                 font: .systemFont(ofSize: 9))
                }
            }

            
            currentY += 5
            drawCentered(text: "------------------------------",
                        y: &currentY,
                        pageWidth: pageWidth,
                        font: .systemFont(ofSize: 10))
            currentY += 5
            
            // Total
            let totalText = String(format: "TOTAL: %.2f €", total)
            drawCentered(text: totalText,
                        y: &currentY,
                        pageWidth: pageWidth,
                        font: .boldSystemFont(ofSize: 12))
            
            
            
            // ici met l'image qui est ic_receipt_qr_code avant le text
            if let qrImage = UIImage(named: "ic_receipt_qr_code") {
                let qrSize: CGFloat = 80
                let qrX = (pageWidth - qrSize) / 2
                let qrRect = CGRect(x: qrX, y: currentY + 10, width: qrSize, height: qrSize)
                qrImage.draw(in: qrRect)
                currentY += qrSize + 20   // on avance le curseur sous le QR code
            } else {
                // Optionnel: laisser un peu d'espace si l'image n'est pas trouvée
                currentY += 20
            }
            currentY += 10
            drawCentered(text: "Merci et à bientôt",
                        y: &currentY,
                        pageWidth: pageWidth,
                        font: .systemFont(ofSize: 10))
        }
        
        return data
    }
    
    // Helpers dessin texte
    private func drawCentered(text: String,
                              y: inout CGFloat,
                              pageWidth: CGFloat,
                              font: UIFont) {
        let attributes: [NSAttributedString.Key: Any] = [
            .font: font
        ]
        let size = text.size(withAttributes: attributes)
        let x = (pageWidth - size.width) / 2.0
        text.draw(at: CGPoint(x: x, y: y), withAttributes: attributes)
        y += size.height + 2
    }
    
    private func drawLeftRightLine(left: String,
                                   right: String,
                                   y: inout CGFloat,
                                   pageWidth: CGFloat,
                                   font: UIFont) {
        let attributes: [NSAttributedString.Key: Any] = [
            .font: font
        ]
        let leftPoint = CGPoint(x: 10, y: y)
        left.draw(at: leftPoint, withAttributes: attributes)
        
        let rightSize = right.size(withAttributes: attributes)
        let rightX = pageWidth - rightSize.width - 10
        let rightPoint = CGPoint(x: rightX, y: y)
        right.draw(at: rightPoint, withAttributes: attributes)
        
        y += max(left.size(withAttributes: attributes).height,
                 rightSize.height) + 2
    }
}


private func formattedDateWithMilliseconds() -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "dd/MM/yyyy HH:mm:ss.SSS"
    return formatter.string(from: Date())
}

private func generateTicketID() -> String {
    return UUID().uuidString.prefix(8).uppercased()
}

*/



import UIKit
import PDFKit

struct ReceiptItem {
    let name: String
    let quantity: Int
    let price: Double
    let category: String?
    let menu: String?
}

class ReceiptPDFGenerator {
    
    enum DisplayMode {
        case category
        case menu
    }
    
    func generateReceiptPDF(items: [ReceiptItem],
                            total: Double,
                            mode: DisplayMode = .category) -> Data {
        let pageWidth: CGFloat = 300
        let pageHeight: CGFloat = 800
        let pageRect = CGRect(x: 0, y: 0, width: pageWidth, height: pageHeight)
        
        let renderer = UIGraphicsPDFRenderer(bounds: pageRect)
        
        let data = renderer.pdfData { context in
            context.beginPage()
            var currentY: CGFloat = 20
            
            if let qrImage = UIImage(named:"ic_holly_fork_whithout_bg") {
                let qrSize: CGFloat = 80
                let qrX = (pageWidth - qrSize) / 2
                qrImage.draw(in: CGRect(x: qrX, y: currentY, width: qrSize, height: qrSize))
                currentY += qrSize + 20
            }
            
            drawCentered(text: "******", y: &currentY, pageWidth: pageWidth, font: .systemFont(ofSize: 12))
            drawCentered(text: "REÇU DE CAISSE", y: &currentY, pageWidth: pageWidth, font: .boldSystemFont(ofSize: 14))
            drawCentered(text: "******", y: &currentY, pageWidth: pageWidth, font: .systemFont(ofSize: 12))
            currentY += 10
            
            let headerFont = UIFont.systemFont(ofSize: 9)
            let dateText = formattedDateWithMilliseconds()
            let ticketID = "ID: \(generateTicketID())"
            dateText.draw(at: CGPoint(x: 10, y: currentY), withAttributes: [.font: headerFont])
            let idSize = ticketID.size(withAttributes: [.font: headerFont])
            ticketID.draw(at: CGPoint(x: pageWidth - idSize.width - 10, y: currentY), withAttributes: [.font: headerFont])
            currentY += max(dateText.size(withAttributes: [.font: headerFont]).height, idSize.height) + 8
            
            drawCentered(text: "------------------------------", y: &currentY, pageWidth: pageWidth, font: .systemFont(ofSize: 10))
            currentY += 5
            
            switch mode {
            case .category:
                let categories = ["Entrée", "Plat", "Dessert", "Boisson"]
                for cat in categories {
                    let catItems = items.filter { $0.category == cat }
                    if !catItems.isEmpty {
                        drawCentered(text: cat, y: &currentY, pageWidth: pageWidth, font: .boldSystemFont(ofSize: 11))
                        currentY += 2
                        for item in catItems {
                            drawItemLine(item: item, currentY: &currentY, pageWidth: pageWidth)
                        }
                        currentY += 5
                    }
                }
            case .menu:
                let menus = Array(Set(items.compactMap { $0.menu })).sorted()
                for menu in menus {
                    let menuItems = items.filter { $0.menu == menu }
                    drawCentered(text: menu, y: &currentY, pageWidth: pageWidth, font: .boldSystemFont(ofSize: 11))
                    currentY += 2
                    for item in menuItems {
                        drawItemLine(item: item, currentY: &currentY, pageWidth: pageWidth)
                    }
                    currentY += 5
                }
            }
            
            drawCentered(text: "------------------------------", y: &currentY, pageWidth: pageWidth, font: .systemFont(ofSize: 10))
            currentY += 5
            
            drawCentered(text: String(format: "TOTAL: %.2f €", total), y: &currentY, pageWidth: pageWidth, font: .boldSystemFont(ofSize: 12))
            
            if let qrImage = UIImage(named: "ic_receipt_qr_code") {
                let qrSize: CGFloat = 80
                let qrX = (pageWidth - qrSize) / 2
                qrImage.draw(in: CGRect(x: qrX, y: currentY + 10, width: qrSize, height: qrSize))
                currentY += qrSize + 20
            }
            
            currentY += 10
            drawCentered(text: "Merci et à bientôt", y: &currentY, pageWidth: pageWidth, font: .systemFont(ofSize: 10))
            
            let footerText = """
            Ticket généré par Holly Fork,
            pour plus d'informations : https://hollyfork.com/
            """

            let footerFont = UIFont.systemFont(ofSize: 8)
            let attributes: [NSAttributedString.Key: Any] = [
                .font: footerFont
            ]

            let yPosition = pageHeight - 20

            let lines = footerText.components(separatedBy: "\n")
            for (i, line) in lines.enumerated() {
                line.draw(at: CGPoint(x: 10, y: yPosition + CGFloat(i) * (footerFont.lineHeight + 1)), withAttributes: attributes)
            }

        }
        
        return data
    }
    
    private func drawItemLine(item: ReceiptItem, currentY: inout CGFloat, pageWidth: CGFloat) {
        let lineTotal = item.price * Double(item.quantity)
        drawLeftRightLine(left: "\(item.quantity)x \(item.name)", right: String(format: "%.2f €", lineTotal), y: &currentY, pageWidth: pageWidth, font: .systemFont(ofSize: 10))
        if item.quantity > 1 {
            drawCentered(text: String(format: "%.2f € x %d", item.price, item.quantity), y: &currentY, pageWidth: pageWidth, font: .systemFont(ofSize: 9))
        }
    }
    
    private func drawCentered(text: String, y: inout CGFloat, pageWidth: CGFloat, font: UIFont) {
        let size = text.size(withAttributes: [.font: font])
        text.draw(at: CGPoint(x: (pageWidth - size.width)/2, y: y), withAttributes: [.font: font])
        y += size.height + 2
    }
    
    private func drawLeftRightLine(left: String, right: String, y: inout CGFloat, pageWidth: CGFloat, font: UIFont) {
        left.draw(at: CGPoint(x: 10, y: y), withAttributes: [.font: font])
        let rightSize = right.size(withAttributes: [.font: font])
        right.draw(at: CGPoint(x: pageWidth - rightSize.width - 10, y: y), withAttributes: [.font: font])
        y += max(left.size(withAttributes: [.font: font]).height, rightSize.height) + 2
    }
}

private func formattedDateWithMilliseconds() -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "dd/MM/yyyy HH:mm:ss.SSS"
    return formatter.string(from: Date())
}

private func generateTicketID() -> String {
    return UUID().uuidString.prefix(8).uppercased()
}

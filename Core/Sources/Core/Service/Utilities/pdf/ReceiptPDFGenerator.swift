import UIKit
import PDFKit




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

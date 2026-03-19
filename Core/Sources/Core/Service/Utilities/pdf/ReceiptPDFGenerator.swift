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
        let estimatedHeight = calculateTotalHeight(items: items, mode: mode)

        let renderer = UIGraphicsPDFRenderer(
            bounds: CGRect(x: 0, y: 0, width: pageWidth, height: estimatedHeight)
        )

        let data = renderer.pdfData { context in
            context.beginPage()

            var currentY: CGFloat = 20

            drawHeader(&currentY, pageWidth: pageWidth)
            currentY += 20

            drawItemsForPage(items: items, mode: mode, currentY: &currentY, pageWidth: pageWidth)

            currentY += 20
            drawFooter(&currentY, total: total, pageWidth: pageWidth)
        }

        return data
    }


    private func calculateTotalHeight(items: [ReceiptItem], mode: DisplayMode) -> CGFloat {
        var height: CGFloat = 0

        height += 20
        height += 60 + 15
        height += 20
        height += 15
        height += 20 + 20

        if mode == .category {
            let categories = Set(items.compactMap { $0.category })
            height += CGFloat(categories.count) * 18
        } else {
            let menus = Set(items.compactMap { $0.menu })
            height += CGFloat(menus.count) * 18
        }

        for item in items {
            height += 14 + 2
            if item.quantity > 1 {
                height += 13 + 2
            }
        }

        height += 20
        height += 22
        height += 10 + 80 + 20
        height += 20
        height += 20
        height += 20

        return height
    }


    private func drawHeader(_ currentY: inout CGFloat, pageWidth: CGFloat) {
        if let logo = UIImage(named: "ic_holly_fork_whithout_bg") {
            let logoSize: CGFloat = 60
            let logoX = (pageWidth - logoSize) / 2
            logo.draw(in: CGRect(x: logoX, y: currentY, width: logoSize, height: logoSize))
            currentY += logoSize + 15
        }

        drawCentered(
            text: "REÇU DE CAISSE",
            y: &currentY,
            pageWidth: pageWidth,
            font: .boldSystemFont(ofSize: 14)
        )

        let dateText = formattedDateWithMilliseconds()
        let ticketID = "ID: \(generateTicketID())"
        dateText.draw(
            at: CGPoint(x: 10, y: currentY),
            withAttributes: [.font: UIFont.systemFont(ofSize: 9)]
        )
        let idSize = ticketID.size(withAttributes: [.font: UIFont.systemFont(ofSize: 9)])
        ticketID.draw(
            at: CGPoint(x: pageWidth - idSize.width - 10, y: currentY),
            withAttributes: [.font: UIFont.systemFont(ofSize: 9)]
        )
        currentY += 25
    }


    private func drawItemsForPage(items: [ReceiptItem],
                                  mode: DisplayMode,
                                  currentY: inout CGFloat,
                                  pageWidth: CGFloat) {
        switch mode {
        case .category:
            let categories = Array(Set(items.compactMap { $0.category })).sorted()
            for cat in categories {
                let catItems = items.filter { $0.category == cat }
                guard !catItems.isEmpty else { continue }
                drawCentered(
                    text: cat,
                    y: &currentY,
                    pageWidth: pageWidth,
                    font: .boldSystemFont(ofSize: 11)
                )
                for item in catItems {
                    drawItemLine(item: item, currentY: &currentY, pageWidth: pageWidth)
                }
            }

        case .menu:
            let menus = Array(Set(items.compactMap { $0.menu })).sorted()
            for menu in menus {
                let menuItems = items.filter { $0.menu == menu }
                guard !menuItems.isEmpty else { continue }
                drawCentered(
                    text: menu,
                    y: &currentY,
                    pageWidth: pageWidth,
                    font: .boldSystemFont(ofSize: 11)
                )
                for item in menuItems {
                    drawItemLine(item: item, currentY: &currentY, pageWidth: pageWidth)
                }
            }
        }
    }


    private func drawFooter(_ currentY: inout CGFloat, total: Double, pageWidth: CGFloat) {
        drawCentered(
            text: String(format: "TOTAL: %.2f €", total),
            y: &currentY,
            pageWidth: pageWidth,
            font: .boldSystemFont(ofSize: 16)
        )

        if let qrImage = UIImage(named: "ic_receipt_qr_code") {
            let qrSize: CGFloat = 80
            let qrX = (pageWidth - qrSize) / 2
            qrImage.draw(in: CGRect(x: qrX, y: currentY + 10, width: qrSize, height: qrSize))
            currentY += qrSize + 20
        }

        drawCentered(
            text: "Merci et à bientôt",
            y: &currentY,
            pageWidth: pageWidth,
            font: .systemFont(ofSize: 12)
        )

        let footerText = "Holly Fork - https://hollyfork.com/"
        footerText.draw(
            at: CGPoint(x: 10, y: currentY + 10),
            withAttributes: [.font: UIFont.systemFont(ofSize: 8)]
        )
    }


    private func drawItemLine(item: ReceiptItem, currentY: inout CGFloat, pageWidth: CGFloat) {
        let lineTotal = item.price * Double(item.quantity)
        drawLeftRightLine(
            left: "\(item.quantity)x \(item.name)",
            right: String(format: "%.2f €", lineTotal),
            y: &currentY,
            pageWidth: pageWidth,
            font: .systemFont(ofSize: 10)
        )
        if item.quantity > 1 {
            drawCentered(
                text: String(format: "%.2f € x %d", item.price, item.quantity),
                y: &currentY,
                pageWidth: pageWidth,
                font: .systemFont(ofSize: 9)
            )
        }
    }

    private func drawCentered(text: String, y: inout CGFloat, pageWidth: CGFloat, font: UIFont) {
        let attrs: [NSAttributedString.Key: Any] = [.font: font]
        let size = text.size(withAttributes: attrs)
        text.draw(at: CGPoint(x: (pageWidth - size.width) / 2, y: y), withAttributes: attrs)
        y += size.height + 2
    }

    private func drawLeftRightLine(left: String, right: String,
                                   y: inout CGFloat, pageWidth: CGFloat, font: UIFont) {
        let attrs: [NSAttributedString.Key: Any] = [.font: font]
        left.draw(at: CGPoint(x: 10, y: y), withAttributes: attrs)
        let rightSize = right.size(withAttributes: attrs)
        right.draw(at: CGPoint(x: pageWidth - rightSize.width - 10, y: y), withAttributes: attrs)
        y += max(left.size(withAttributes: attrs).height, rightSize.height) + 2
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

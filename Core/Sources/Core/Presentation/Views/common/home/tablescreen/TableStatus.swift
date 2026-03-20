import SwiftUI


public enum TableStatus {
    case free
    case occupiedMain
    case occupiedStarter
    case occupiedDish
    case occupiedDessert
    case occupiedCompleted

    var backgroundColor: Color {
        switch self {
        case .free:              return Color(argb: 0xFFFFFFFF)
        case .occupiedMain:      return Color(argb: 0xFF8C52FF)
        case .occupiedStarter:   return Color(argb: 0xFFFF5757)
        case .occupiedDish:      return Color(argb: 0xFFFFBD59)
        case .occupiedDessert:   return Color(argb: 0xFF7ED957)
        case .occupiedCompleted: return Color(argb: 0xFF0CC0DF)
        }
    }

    var textColor: Color {
        switch self {
        case .free: return .black
        default:    return .white
        }
    }

    var borderColor: Color {
        switch self {
        case .free: return .black.opacity(0.8)
        default:    return backgroundColor.opacity(0.4)
        }
    }
}


public enum TableShape {
    case square
    case circle
}


public struct TableItem: Identifiable {
    public let id: String
    public let number: String
    public let status: TableStatus
    public let shape: TableShape
    public let rotation: Double
    public let offset: CGSize
    public let isBorderVisible: Bool
    
    public init(
        number: String,
        status: TableStatus,
        shape: TableShape = .square,
        rotation: Double = 0,
        offset: CGSize = .zero,
        isBorderVisible: Bool = false
    ) {
        self.id       = number
        self.number   = number
        self.status   = status
        self.shape    = shape
        self.rotation = rotation
        self.offset   = offset
        self.isBorderVisible = isBorderVisible

    }
}


public struct TableComponentView: View {

    let table: TableItem
    let onTap: (String) -> Void

    @State private var isPressed = false

    private let size: CGFloat = 72

    public var body: some View {
        Button {
            onTap(table.number)
        } label: {
            ZStack {
                Group {
                    if table.shape == .circle {
                        Circle()
                            .fill(table.status.backgroundColor)
                            .overlay(
                                Circle()
                                    .strokeBorder(
                                        table.isBorderVisible ? Color.black : table.status.borderColor,
                                        lineWidth: table.isBorderVisible ? 2 : 1.5
                                    )
                            )
                    } else {
                        RoundedRectangle(cornerRadius: 10)
                            .fill(table.status.backgroundColor)
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .strokeBorder(
                                        table.isBorderVisible ? Color.black : table.status.borderColor,
                                        lineWidth: table.isBorderVisible ? 2 : 1.5
                                    )
                            )
                    }
                }
                .frame(width: size, height: size)
                .shadow(
                    color: table.status == .free
                        ? .black.opacity(0.18)
                        : table.status.backgroundColor.opacity(0.45),
                    radius: isPressed ? 4 : 10,
                    x: isPressed ? 1 : 3,
                    y: isPressed ? 1 : 6
                )

                Text(table.number)
                    .font(.system(size: 13, weight: .semibold, design: .rounded))
                    .foregroundColor(table.status.textColor)
            }
        }
        .buttonStyle(PlainButtonStyle())
        .rotationEffect(.degrees(table.rotation))
        .offset(table.offset)
        .scaleEffect(isPressed ? 0.92 : 1.0)
        .animation(.spring(response: 0.25, dampingFraction: 0.6), value: isPressed)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in isPressed = true  }
                .onEnded   { _ in isPressed = false }
        )
    }
}


public struct FloorPlanDemoView: View {

    @ObservedObject var tableSearchViewModel: TableSearchViewModel

        private let tables: [TableItem] = [
            TableItem(number: "T900", status: .free, rotation: -12,
                      offset: CGSize(width: -120, height: -100),
                      isBorderVisible: true ),

            TableItem(number: "T901", status: .free, rotation: -12,
                      offset: CGSize(width: -220, height: -100),
                      isBorderVisible: true ),

            TableItem(number: "T902", status: .free, rotation: -12,
                      offset: CGSize(width: -120, height: -200),
                      isBorderVisible: true ),

            TableItem(number: "T903", status: .free, rotation: -12,
                      offset: CGSize(width: -120, height: 0)),

            TableItem(number: "T904", status: .occupiedMain, rotation: 8,
                      offset: CGSize(width: 0, height: -220)),

            TableItem(number: "T905", status: .occupiedStarter, rotation: 15,
                      offset: CGSize(width: 160, height: -80),
                      isBorderVisible: true ),

            TableItem(number: "T906", status: .occupiedDish, rotation: -8,
                      offset: CGSize(width: 120, height: 80)),

            TableItem(number: "T907", status: .occupiedDessert, shape: .circle,
                      offset: CGSize(width: -80, height: 140),
                      isBorderVisible: true ),

            TableItem(number: "T908", status: .occupiedCompleted, shape: .circle,
                      offset: CGSize(width: 60, height: 160)),
        ]
    

    public var body: some View {
        ZStack {
            Color(argb: 0xFFF5F6F8)
                .ignoresSafeArea()

            Canvas { ctx, size in
                let step: CGFloat = 40
                var x: CGFloat = 0
                while x <= size.width {
                    var path = Path()
                    path.move(to: CGPoint(x: x, y: 0))
                    path.addLine(to: CGPoint(x: x, y: size.height))
                    ctx.stroke(path, with: .color(.gray.opacity(0.08)), lineWidth: 1)
                    x += step
                }
                var y: CGFloat = 0
                while y <= size.height {
                    var path = Path()
                    path.move(to: CGPoint(x: 0, y: y))
                    path.addLine(to: CGPoint(x: size.width, y: y))
                    ctx.stroke(path, with: .color(.gray.opacity(0.08)), lineWidth: 1)
                    y += step
                }
            }

            ZStack {
                ForEach(tables) { table in
                    TableComponentView(table: table) { tableLabel in
                        let raw = tableLabel.hasPrefix("T") ? String(tableLabel.dropFirst()) : tableLabel
                        guard !raw.isEmpty, let id = Int(raw) else { return }
                        Task { await tableSearchViewModel.searchTable(numero: id) }
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

          
        }
    }

}

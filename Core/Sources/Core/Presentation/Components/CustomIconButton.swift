import SwiftUI

struct CustomIconButton: View {
    let systemName: String?
    let imageName: String?
    let title: String?
    let action: () -> Void

    init(
        systemName: String? = nil,
        imageName: String? = nil,
        title: String? = nil,
        action: @escaping () -> Void
    ) {
        self.systemName = systemName
        self.imageName = imageName
        self.title = title
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            ZStack {
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.black)
                    .frame(width: 70, height: 70)

                if let imageName = imageName {
                    Image(imageName)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 40, height: 40)
                        .foregroundStyle(.white)
                } else if let systemName = systemName {
                    Image(systemName: systemName)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundStyle(.white)
                } else if let title = title {
                    Text(title)
                        .font(.headline)
                        .foregroundStyle(.white)
                }
            }
        }
        .buttonStyle(.plain)
    }
}


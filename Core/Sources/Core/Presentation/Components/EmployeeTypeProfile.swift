
import SwiftUI
import SwiftUI

struct EmployeeTypeProfile: View {
    let employeeName: String
    let typeEmployee: String?
    let typeEmployeeIsVisible: Bool
    let profileImage: Image
    let imageSize: CGFloat
    
    init(
        employeeName: String,
        typeEmployee: String? = nil,
        typeEmployeeIsVisible: Bool = true,
        profileImage: Image,
        imageSize: CGFloat = 60
    ) {
        self.employeeName = employeeName
        self.typeEmployee = typeEmployee
        self.typeEmployeeIsVisible = typeEmployeeIsVisible
        self.profileImage = profileImage
        self.imageSize = imageSize
    }
    
    var body: some View {
        HStack(alignment: .bottom, spacing: 16) {
            profileImage
                .resizable()
                .scaledToFill()
                .frame(width: imageSize, height: imageSize)
                .clipShape(Circle())
                .overlay(Circle().stroke(Color.gray.opacity(0.5), lineWidth: 1))
                .shadow(radius: 2)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(employeeName)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.primary)
                
                if typeEmployeeIsVisible, let typeEmployee {
                    Text(typeEmployee)
                        .font(.system(size: 16))
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
        .padding(.horizontal)
    }
}

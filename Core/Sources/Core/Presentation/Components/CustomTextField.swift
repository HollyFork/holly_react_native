import SwiftUI

struct CustomTextField: View {
    var placeholder: String
    @Binding var text: String
    var hasError: Bool = false
    
    init(_ placeholder: String, text: Binding<String>, hasError: Bool = false) {
        self.placeholder = placeholder
        self._text = text
        self.hasError = hasError
    }
    
    var body: some View {
        TextField(placeholder, text: $text)
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(hasError ? Color.red : Color.gray.opacity(0.4), lineWidth: 1.2)
            )
            .padding(.horizontal, 40)
    }
}

struct CustomSecureField: View {
    var placeholder: String
    @Binding var text: String
    var hasError: Bool = false
    
    init(_ placeholder: String, text: Binding<String>, hasError: Bool = false) {
        self.placeholder = placeholder
        self._text = text
        self.hasError = hasError
    }
    
    var body: some View {
        SecureField(placeholder, text: $text)
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(hasError ? Color.red : Color.gray.opacity(0.4), lineWidth: 1.2)
            )
            .padding(.horizontal, 40)
    }
}

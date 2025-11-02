//
//  ContentView.swift
//  Holly Fork Watch OS Watch App
//
//  Created by Zine Eddine Hadj Rabah on 12/10/2025.
//

import SwiftUI
import SwiftUI

struct NotificationView: View {
    var body: some View {
        VStack(spacing: 16) {
            // --- Titre principal (T 110) ---
            Text("T 110")
                .font(.system(size: 48, weight: .bold))
                .foregroundColor(Color.green)
                .padding(.top, 8)
            
            // --- Sous-titres (Plats / Réclame 02) ---
            VStack(spacing: 4) {
                Text("Plats")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(.white)
                
                Text("Réclame 02")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white)
            }
            .padding(.vertical, 8)
            
            // --- Bouton OK ---
            Button(action: {
                // Action du bouton (à définir)
            }) {
                Text("Ok")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(Color.green)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(Color.green, lineWidth: 2)
                    )
            }
            .buttonStyle(.plain)
            .padding(.horizontal, 20)
            
            Spacer()
        }
        .padding()
        .background(Color.black.ignoresSafeArea())
    }
}

#Preview {
    NotificationView()
}

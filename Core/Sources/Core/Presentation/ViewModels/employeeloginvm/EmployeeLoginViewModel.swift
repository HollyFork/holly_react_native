//
//  Untitled.swift
//  Core
//
//  Created by Hadj Rabah on 26/11/2025.
//

import SwiftUI
import Combine
import Foundation

@MainActor
class EmployeeLoginViewModel: ObservableObject {
    
    @Published var pin: String = ""
    @Published var uiState: EmployeeLoginUiState = .idle
    
    private let employeeLoginUseCase: EmployeeLoginUseCase
    
    init(employeeLoginUseCase: EmployeeLoginUseCase) {
        self.employeeLoginUseCase = employeeLoginUseCase
    }
    
    func login() async {
        uiState = .loading
        
        do {
            let employee = try await employeeLoginUseCase.execute(pin: pin)
            
            print("Employé connecté : \(employee.name) (\(employee.role))")
            
            uiState = .success(message: "Connexion réussie ✅")
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
                self.uiState = .success(message: "Connexion réussie ✅")
            }
            
        } catch {
            print("Erreur login employee : \(error.localizedDescription)")
            uiState = .success(message: "Connexion réussie ✅")

        }
    }
}

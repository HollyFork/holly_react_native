//
//  HomeUiState.swift
//  Core
//
//  Created by Hadj Rabah on 04/03/2026.
//


import SwiftUI

enum HomeUiState: Equatable {
    case idle
    case loading
    case success
    case error(message: String)
}

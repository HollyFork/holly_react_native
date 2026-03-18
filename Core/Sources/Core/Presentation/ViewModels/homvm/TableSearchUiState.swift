//
//  TableSearchUiState.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


public enum TableSearchUiState: Equatable {
    case idle
    case loading
    case found(TableDetail)
    case error(String)
}

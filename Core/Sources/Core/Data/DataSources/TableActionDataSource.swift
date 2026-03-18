//
//  TableActionDataSource.swift
//  Core
//
//  Created by Hadj Rabah on 15/03/2026.
//


import Foundation
import Foundation

protocol TableActionDataSource {
    func getTableById(tableId: Int)                         async throws -> TableDTO
    func getSalles(restaurantId: Int)                  async throws -> SalleListDTO
    func createTable(_ dto: CreateTableRequestDTO)     async throws -> TableDTO
    func getCommandesEnCours(tableId: Int)             async throws -> CommandeEnCoursListDTO
}

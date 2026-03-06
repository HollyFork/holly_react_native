//
//  Planning.swift
//  Core
//
//  Created by Hadj Rabah on 06/03/2026.
//


struct Planning {
    let restaurant: Restaurant
    let semaine: Semaine
    let jours: [Jour]
    let totalSemaineHeures: Double
}

struct Restaurant {
    let id: Int
    let nom: String
}

struct Semaine {
    let debut: String
    let fin: String
}

struct Jour {
    let date: String
    let jour: String
    let creneaux: [Creneau]
    let totalHeures: Double
}

struct Creneau {
    let debut: String
    let fin: String
}
//
//  NetworkLogger.swift
//  Core
//
//  Created by Hadj Rabah on 14/03/2026.
//


import Foundation

final class NetworkLogger {

    static let shared = NetworkLogger()
    private init() {}

    // MARK: - Request
    func logRequest(_ request: URLRequest) {
        let method  = request.httpMethod ?? "?"
        let url     = request.url?.absoluteString ?? "?"

        print("\n┌─── 📤 REQUEST ─────────────────────────────────")
        print("│ \(method) \(url)")

        if let headers = request.allHTTPHeaderFields, !headers.isEmpty {
            print("│ Headers:")
            headers.forEach { print("│   \($0.key): \($0.value)") }
        }

        if let body = request.httpBody {
            print("│ Body:")
            print(prettyJSON(from: body, prefix: "│   "))
        }

        print("└────────────────────────────────────────────────\n")
    }

    // MARK: - Response
    func logResponse(
        _ response: HTTPURLResponse?,
        data: Data?,
        error: Error?,
        duration: TimeInterval
    ) {
        let status  = response?.statusCode ?? 0
        let url     = response?.url?.absoluteString ?? "?"
        let icon    = (200...299).contains(status) ? "✅" : "❌"

        print("\n┌─── 📥 RESPONSE ────────────────────────────────")
        print("│ \(icon) \(status) — \(url)")
        print("│ ⏱ \(String(format: "%.0f", duration * 1000)) ms")

        if let error {
            print("│ ❌ Error: \(error.localizedDescription)")
        }

        if let data, !data.isEmpty {
            print("│ Body:")
            print(prettyJSON(from: data, prefix: "│   "))
        }

        print("└────────────────────────────────────────────────\n")
    }

    // MARK: - Decode Error
    func logDecodeError(_ error: DecodingError, data: Data?) {
        print("\n┌─── ⚠️  DECODE ERROR ───────────────────────────")
        switch error {
        case .typeMismatch(let type, let ctx):
            print("│ TypeMismatch: \(type) — \(ctx.debugDescription)")
            print("│ CodingPath: \(ctx.codingPath.map(\.stringValue).joined(separator: " → "))")
        case .valueNotFound(let type, let ctx):
            print("│ ValueNotFound: \(type) — \(ctx.debugDescription)")
            print("│ CodingPath: \(ctx.codingPath.map(\.stringValue).joined(separator: " → "))")
        case .keyNotFound(let key, let ctx):
            print("│ KeyNotFound: '\(key.stringValue)' — \(ctx.debugDescription)")
            print("│ CodingPath: \(ctx.codingPath.map(\.stringValue).joined(separator: " → "))")
        case .dataCorrupted(let ctx):
            print("│ DataCorrupted: \(ctx.debugDescription)")
        @unknown default:
            print("│ Unknown: \(error)")
        }
        if let data {
            print("│ Raw JSON reçu:")
            print(prettyJSON(from: data, prefix: "│   "))
        }
        print("└────────────────────────────────────────────────\n")
    }

    // MARK: - Private
    private func prettyJSON(from data: Data, prefix: String) -> String {
        guard
            let obj  = try? JSONSerialization.jsonObject(with: data),
            let pretty = try? JSONSerialization.data(withJSONObject: obj, options: .prettyPrinted),
            let str  = String(data: pretty, encoding: .utf8)
        else {
            return prefix + (String(data: data, encoding: .utf8) ?? "<binary>")
        }
        return str
            .split(separator: "\n", omittingEmptySubsequences: false)
            .map { prefix + $0 }
            .joined(separator: "\n")
    }
}
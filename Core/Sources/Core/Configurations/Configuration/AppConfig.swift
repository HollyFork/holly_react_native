import Foundation

struct AppConfig {
    static var baseURL: String {
        guard let url = Bundle.main.object(forInfoDictionaryKey: "BASE_URL_API") as? String else {
            fatalError("BASE_URL_API non défini dans les configurations !")
        }
        return url
    }
}



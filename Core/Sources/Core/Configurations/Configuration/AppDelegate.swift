import SwiftUI
import UIKit

public class AppDelegate: NSObject, UIApplicationDelegate {
    static var orientationLock = UIInterfaceOrientationMask.all

    public func application(
        _ application: UIApplication,
        supportedInterfaceOrientationsFor window: UIWindow?
    ) -> UIInterfaceOrientationMask {
        return AppDelegate.orientationLock
    }

    public func applicationDidFinishLaunching(_ application: UIApplication) {
        if KeychainManager.shared.getRefreshToken() != nil {
            print("Démarrage du TokenRefresher")
            TokenRefresher.shared.startRefreshing()
        }
    }

    public func applicationWillTerminate(_ application: UIApplication) {
        TokenRefresher.shared.stopRefreshing()
    }
}

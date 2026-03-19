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
        print("✅ App démarrée — TokenRefresher actif (mode réactif)")
    }

    public func applicationWillTerminate(_ application: UIApplication) {}
    
}

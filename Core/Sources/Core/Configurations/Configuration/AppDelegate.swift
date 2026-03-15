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
        // Le TokenRefresher est désormais automatique :
        // il se déclenche uniquement sur réception d'un 401
        // Aucune initialisation manuelle nécessaire
        print("✅ App démarrée — TokenRefresher actif (mode réactif)")
    }

    public func applicationWillTerminate(_ application: UIApplication) {
        // Rien à stopper — pas de timer en arrière-plan
    }
}

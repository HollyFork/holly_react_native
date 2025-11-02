
import SwiftUI
import UIKit

public final class OrientationManager {
    
    public  static func lockOrientation(_ orientation: UIInterfaceOrientationMask,
                                andRotateTo rotateOrientation: UIInterfaceOrientation? = nil) {
        
        AppDelegate.orientationLock = orientation  
        
        if let rotateOrientation = rotateOrientation {
            UIDevice.current.setValue(rotateOrientation.rawValue, forKey: "orientation")
            UIViewController.attemptRotationToDeviceOrientation()
        }
    }
}

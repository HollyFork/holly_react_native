
import SwiftUI
import UIKit
import Foundation

public enum DeviceType {
    case iPhone
    case iPad
}

public class DeviceHelper {
    
    public static var current: DeviceType {
        UIDevice.current.userInterfaceIdiom == .pad ? .iPad : .iPhone
    }
    
    public static var isIPad: Bool {
        UIDevice.current.userInterfaceIdiom == .pad
    }
    
    public static var isIPhone: Bool {
        UIDevice.current.userInterfaceIdiom == .phone
    }
    
}

import ExpoModulesCore
import UIKit

/** Streams the earpiece proximity sensor as near/far events; JS counts a push-up on far → near. */
public class OpProximityModule: Module {
  private var observer: NSObjectProtocol?

  public func definition() -> ModuleDefinition {
    Name("OpProximity")
    Events("onChange")

    // iOS has no "has sensor" query: monitoring stays off on devices without one.
    AsyncFunction("isAvailable") { () -> Bool in
      let device = UIDevice.current
      let wasOn = device.isProximityMonitoringEnabled
      device.isProximityMonitoringEnabled = true
      let available = device.isProximityMonitoringEnabled
      device.isProximityMonitoringEnabled = wasOn
      return available
    }.runOnQueue(.main)

    // The sensor runs only while JS listens; iOS blanks the screen while near, JS keeps running.
    OnStartObserving("onChange") {
      DispatchQueue.main.async { self.start() }
    }

    OnStopObserving("onChange") {
      DispatchQueue.main.async { self.stop() }
    }

    // A JS reload can tear the module down without a stop: never leave monitoring on.
    OnDestroy {
      DispatchQueue.main.async { self.stop() }
    }
  }

  private func start() {
    guard observer == nil else { return }
    UIDevice.current.isProximityMonitoringEnabled = true
    observer = NotificationCenter.default.addObserver(
      forName: UIDevice.proximityStateDidChangeNotification, object: nil, queue: .main
    ) { [weak self] _ in
      self?.sendEvent("onChange", ["near": UIDevice.current.proximityState])
    }
  }

  private func stop() {
    if let observer { NotificationCenter.default.removeObserver(observer) }
    observer = nil
    UIDevice.current.isProximityMonitoringEnabled = false
  }
}

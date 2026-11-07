package expo.modules.opproximity

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/** Streams the earpiece proximity sensor as near/far events; JS counts a push-up on far → near. */
class OpProximityModule : Module() {
  private val manager: SensorManager?
    get() = appContext.reactContext?.getSystemService(Context.SENSOR_SERVICE) as? SensorManager

  private val sensor: Sensor?
    get() = manager?.getDefaultSensor(Sensor.TYPE_PROXIMITY)

  // Binary sensors report "far" as maximumRange, analog ones report cm: anything below max is near.
  private val listener = object : SensorEventListener {
    override fun onSensorChanged(event: SensorEvent) {
      sendEvent("onChange", mapOf("near" to (event.values[0] < event.sensor.maximumRange)))
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit
  }

  override fun definition() = ModuleDefinition {
    Name("OpProximity")
    Events("onChange")

    AsyncFunction("isAvailable") { sensor != null }

    // The sensor runs only while JS listens: no battery cost outside a push-up set.
    OnStartObserving("onChange") {
      sensor?.let { manager?.registerListener(listener, it, SensorManager.SENSOR_DELAY_GAME) }
    }

    OnStopObserving("onChange") {
      manager?.unregisterListener(listener)
    }
  }
}

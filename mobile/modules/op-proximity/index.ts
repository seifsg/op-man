import { NativeModule, requireOptionalNativeModule, type EventSubscription } from 'expo';

type ProximityEvents = { onChange: (event: { near: boolean }) => void };

declare class OpProximityModule extends NativeModule<ProximityEvents> {
  isAvailable(): Promise<boolean>;
}

// Null on web and in Expo Go (no native code): callers treat that as "no sensor" and offer tap counting.
const native = requireOptionalNativeModule<OpProximityModule>('OpProximity');

/** Resolves true when this device has a proximity sensor the app can read. */
export const hasProximity = async (): Promise<boolean> => (native ? native.isAvailable() : false);

/** Calls `onChange(near)` on every near/far change while subscribed; the sensor is off otherwise. */
export const watchProximity = (onChange: (near: boolean) => void): EventSubscription | null =>
  native?.addListener('onChange', (event) => onChange(event.near)) ?? null;

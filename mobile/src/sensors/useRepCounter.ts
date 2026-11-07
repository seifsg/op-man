import { Accelerometer } from 'expo-sensors';
import { useEffect, useEffectEvent, useState } from 'react';
import { Platform } from 'react-native';
import { hasProximity, watchProximity } from '../../modules/op-proximity/index.ts';
import type { Exercise } from '../core/exercises.ts';
import { edgeCounter, liftCounter, tiltCounter } from '../core/reps.ts';

export type SensorState = 'checking' | 'ready' | 'missing';

// 50 Hz: smooth enough for reps, under Android's 200 Hz cap that needs an extra permission.
const SAMPLE_MS = 20;

// The web build is a UI preview only (browsers cannot read proximity; expo-sensors' web motion shim cannot
// subscribe), so it always runs in tap-to-count mode.
const isAvailable = async (ex: Exercise): Promise<boolean> =>
  Platform.OS !== 'web' && (ex.sensor === 'proximity' ? hasProximity() : Accelerometer.isAvailableAsync());

/**
 * Runs the exercise's sensor and counter while `armed` (countdown + set), so the counter calibrates
 * during the countdown; reps reach `onRep` only while `live`. The sensor is off otherwise.
 */
export function useRepCounter(ex: Exercise, armed: boolean, live: boolean, onRep: () => void): SensorState {
  const [state, setState] = useState<SensorState>('checking');
  const report = useEffectEvent((rep: boolean) => {
    if (rep && live) onRep();
  });

  useEffect(() => {
    let current = true;
    isAvailable(ex).then(
      (ok) => current && setState(ok ? 'ready' : 'missing'),
      (e: unknown) => {
        console.error(`OP Man: ${ex.sensor} sensor check failed`, e);
        if (current) setState('missing');
      },
    );
    return () => {
      current = false;
    };
  }, [ex]);

  useEffect(() => {
    if (!armed || state !== 'ready') return;
    if (ex.sensor === 'proximity') {
      const count = edgeCounter();
      const sub = watchProximity((near) => report(count(near, performance.now() / 1000)));
      return () => sub?.remove();
    }
    const count = ex.sensor === 'tilt' ? tiltCounter() : liftCounter();
    Accelerometer.setUpdateInterval(SAMPLE_MS);
    const sub = Accelerometer.addListener(({ x, y, z, timestamp }) => report(count({ x, y, z }, timestamp)));
    return () => sub.remove();
  }, [ex, armed, state]);

  return state;
}

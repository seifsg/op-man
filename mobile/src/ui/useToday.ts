import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { dayKey } from '../core/plan.ts';

/** Today's day key, refreshed at every local midnight and whenever the app comes back to the foreground. */
export function useToday(): string {
  const [today, setToday] = useState(() => dayKey(new Date()));
  useEffect(() => {
    const refresh = () => setToday(dayKey(new Date()));
    let id: ReturnType<typeof setTimeout>;
    // Re-arms itself each time it fires, so a clock change or an early wake never stops the midnight updates.
    const arm = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      id = setTimeout(() => {
        refresh();
        arm();
      }, Math.max(1000, midnight.getTime() - now.getTime() + 1000));
    };
    arm();
    const sub = AppState.addEventListener('change', (state) => state === 'active' && refresh());
    return () => {
      sub.remove();
      clearTimeout(id);
    };
  }, []);
  return today;
}

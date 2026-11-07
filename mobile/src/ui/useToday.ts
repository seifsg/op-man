import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { dayKey } from '../core/plan.ts';

/** Today's day key, refreshed at local midnight and whenever the app comes back to the foreground. */
export function useToday(): string {
  const [today, setToday] = useState(() => dayKey(new Date()));
  useEffect(() => {
    const refresh = () => setToday(dayKey(new Date()));
    const sub = AppState.addEventListener('change', (state) => state === 'active' && refresh());
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const id = setTimeout(refresh, midnight.getTime() - now.getTime() + 1000);
    return () => {
      sub.remove();
      clearTimeout(id);
    };
  }, [today]);
  return today;
}

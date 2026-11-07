import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** True while the system "reduce motion" setting is on: animations then jump straight to their end. */
export function useReduceMotion(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setOn, (e: unknown) => console.warn('OP Man: reduce-motion check failed', e));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setOn);
    return () => sub.remove();
  }, []);
  return on;
}

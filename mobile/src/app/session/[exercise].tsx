import { useKeepAwake } from 'expo-keep-awake';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { exerciseById, type Exercise } from '../../core/exercises.ts';
import { dayKey, goalOn } from '../../core/plan.ts';
import { addRep, getProgress, useProgress } from '../../data/progress';
import { buzz, cheer, say } from '../../sensors/feedback';
import { useRepCounter } from '../../sensors/useRepCounter';
import { RepRing, SetControls, SetHeader } from '../../ui/SetParts';
import { useTheme, type Theme } from '../../ui/theme';
import { useReduceMotion } from '../../ui/useReduceMotion';
import { useToday } from '../../ui/useToday';

type Phase = 'idle' | 'countdown' | 'live';

// No rep for this long while counting: hint at placement and the +1 button.
const STALL_MS = 12_000;

/** Route /session/:exercise; unknown ids go home. */
export default function SessionRoute() {
  const { exercise } = useLocalSearchParams<{ exercise: string }>();
  const ex = exerciseById(exercise);
  return ex ? <Session ex={ex} /> : <Redirect href="/" />;
}

/** One set: placement tip, countdown while the sensor calibrates, then every rep counted, spoken and saved. */
function Session({ ex }: { ex: Exercise }) {
  // Screen stays on during a set. Leaving before the lock was granted (web, fast back) is harmless: nothing to release.
  useKeepAwake(undefined, { suppressDeactivateWarnings: true });
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const { start, days } = useProgress();
  const today = useToday();
  const [phase, setPhase] = useState<Phase>('idle');
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [stalled, setStalled] = useState(false);
  const pop = useRef(new Animated.Value(1)).current;
  const goal = goalOn(start, today);
  const count = days[today]?.[ex.id] ?? 0;

  /** Saves one rep (or one undo) on today's key, then gives the rep its voice, buzz and pop. */
  const bump = (delta: 1 | -1) => {
    const key = dayKey(new Date());
    addRep(ex.id, delta, key);
    if (delta < 0) return;
    const p = getProgress();
    const n = p.days[key]?.[ex.id] ?? 0;
    const target = goalOn(p.start, key);
    buzz();
    if (!reduceMotion)
      Animated.sequence([
        Animated.timing(pop, { toValue: 1.12, duration: 90, useNativeDriver: true }),
        Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    if (n === target) cheer();
    if (!muted) say(n === target ? `${n}. Target done!` : String(n));
  };

  const sensor = useRepCounter(ex, phase !== 'idle', phase === 'live', () => bump(1));
  const tapMode = sensor === 'missing';
  const speak = useEffectEvent((text: string) => {
    if (!muted) say(text);
  });

  // Countdown: one spoken tick per second, then live. Push-ups get longer to get into a plank.
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (seconds === 0) {
      setPhase('live');
      speak('Go!');
      return;
    }
    speak(String(seconds));
    const id = setTimeout(() => setSeconds((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, seconds]);

  // Every rep restarts the stall clock; no reps for STALL_MS while live shows a placement hint.
  useEffect(() => {
    setStalled(false);
    if (phase !== 'live' || tapMode) return;
    const id = setTimeout(() => setStalled(true), STALL_MS);
    return () => clearTimeout(id);
  }, [phase, count, tapMode]);

  const begin = () => {
    setSeconds(ex.sensor === 'proximity' ? 5 : 3);
    setPhase('countdown');
  };

  const s = styles(t);
  return (
    <View style={[s.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
      <SetHeader ex={ex} muted={muted} onMute={() => setMuted((m) => !m)} t={t} />
      <Text style={s.tip}>{tipText(ex, tapMode, phase, stalled)}</Text>
      <RepRing
        ex={ex}
        size={Math.min(width - 32, 440)}
        count={count}
        goal={goal}
        countdown={phase === 'countdown' ? seconds : null}
        pop={pop}
        onTap={tapMode ? () => bump(1) : null}
        t={t}
      />
      <SetControls ex={ex} idle={phase === 'idle' && !tapMode} ready={sensor === 'ready'} onStart={begin} onBump={bump} t={t} />
    </View>
  );
}

/** What the user should do right now, in one or two lines. */
const tipText = (ex: Exercise, tapMode: boolean, phase: Phase, stalled: boolean): string => {
  const sensor = ex.sensor === 'proximity' ? 'proximity sensor' : 'motion sensor';
  if (tapMode) return `This phone has no ${sensor} the app can read. Tap the ring to count each rep.`;
  if (stalled) return 'No reps picked up yet. Check the phone is placed as shown at the start, or tap + to count.';
  if (phase !== 'live') return ex.tip;
  return ex.sensor === 'proximity' ? 'Counting. Bring your nose close to the phone on every rep.' : 'Counting. Keep the phone steady against you.';
};

const styles = (t: Theme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg, paddingHorizontal: 16 },
    tip: { color: t.soft, fontSize: 17, lineHeight: 24, textAlign: 'center', marginTop: 12, marginHorizontal: 8, minHeight: 72 },
  });

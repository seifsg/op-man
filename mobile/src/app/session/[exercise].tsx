import { useKeepAwake } from 'expo-keep-awake';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { exerciseById, type Exercise } from '../../core/exercises.ts';
import { DAYS, dayIndex, dayKey, target } from '../../core/plan.ts';
import { addRep, getProgress, useProgress } from '../../data/progress';
import { buzz, cheer, say } from '../../sensors/feedback';
import { useRepCounter } from '../../sensors/useRepCounter';
import { Icon } from '../../ui/Icon';
import { leave } from '../../ui/leave';
import { Ring } from '../../ui/Ring';
import { label, numeral, useTheme, type Theme } from '../../ui/theme';

type Phase = 'idle' | 'countdown' | 'live';

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
  const progress = useProgress();
  const [phase, setPhase] = useState<Phase>('idle');
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const pop = useRef(new Animated.Value(1)).current;

  const today = dayKey(new Date());
  const day = progress.start ? dayIndex(progress.start, today) : 1;
  const goal = target(Math.min(day, DAYS));
  const count = progress.days[today]?.[ex.id] ?? 0;

  const bump = (delta: 1 | -1) => {
    const key = dayKey(new Date());
    addRep(ex.id, delta, key);
    if (delta < 0) return;
    const n = getProgress().days[key]?.[ex.id] ?? 0;
    buzz();
    Animated.sequence([
      Animated.timing(pop, { toValue: 1.14, duration: 90, useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    if (n === goal) cheer();
    if (!muted) say(n === goal ? `${n}. Target done!` : String(n));
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

  const start = () => {
    setSeconds(ex.sensor === 'proximity' ? 5 : 3);
    setPhase('countdown');
  };

  const size = Math.min(width - 64, 300);
  const s = styles(t);

  return (
    <View style={[s.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
      <View style={s.header}>
        <Pressable accessibilityLabel="Back" hitSlop={12} onPress={leave}>
          <Icon name="back" color={t.text} />
        </Pressable>
        <Text style={[label, { color: ex.color }]}>{ex.name.toUpperCase()}</Text>
        <Pressable accessibilityLabel={muted ? 'Unmute voice' : 'Mute voice'} hitSlop={12} onPress={() => setMuted((m) => !m)}>
          <Icon name={muted ? 'mute' : 'sound'} color={t.dim} />
        </Pressable>
      </View>

      <Text style={s.tip}>{tapMode ? missingText(ex) : phase === 'live' ? liveText(ex) : ex.tip}</Text>

      <Pressable
        disabled={!tapMode}
        onPress={() => bump(1)}
        accessibilityLabel={tapMode ? 'Tap to count a rep' : undefined}
        style={s.center}
      >
        <Ring size={size} stroke={18} progress={count / goal} color={ex.color} track={t.track}>
          {phase === 'countdown' ? (
            <>
              <Text style={[numeral, { color: t.text, fontSize: size * 0.4 }]}>{seconds}</Text>
              <Text style={[label, { color: t.dim }]}>GET IN POSITION</Text>
            </>
          ) : (
            <>
              <Animated.Text style={[numeral, { color: t.text, fontSize: size * 0.36, transform: [{ scale: pop }] }]}>
                {count}
              </Animated.Text>
              <Text style={[label, { color: count >= goal ? ex.color : t.dim }]}>
                {count >= goal ? 'TARGET DONE' : `OF ${goal} TODAY`}
              </Text>
            </>
          )}
        </Ring>
      </Pressable>

      {phase === 'idle' && !tapMode ? (
        <Pressable
          accessibilityRole="button"
          disabled={sensor !== 'ready'}
          onPress={start}
          style={({ pressed }) => [s.start, { backgroundColor: ex.color, opacity: pressed || sensor !== 'ready' ? 0.7 : 1 }]}
        >
          <Text style={s.startText}>{sensor === 'checking' ? 'Checking sensor…' : 'Start'}</Text>
        </Pressable>
      ) : (
        <View style={s.controls}>
          <Round onPress={() => bump(-1)} label="Remove one rep" icon="minus" t={t} />
          <Pressable accessibilityRole="button" onPress={leave} style={s.done}>
            <Text style={[s.doneText, { color: t.text }]}>Done</Text>
          </Pressable>
          <Round onPress={() => bump(1)} label="Add one rep" icon="plus" t={t} />
        </View>
      )}
    </View>
  );
}

const liveText = (ex: Exercise): string =>
  ex.sensor === 'proximity' ? 'Counting. Bring your nose close to the phone on every rep.' : 'Counting. Keep the phone steady against you.';

const missingText = (ex: Exercise): string =>
  `This phone has no ${ex.sensor === 'proximity' ? 'proximity sensor' : 'motion sensor'} the app can read. Tap the ring to count each rep.`;

/** Round ±1 button: fixes a missed or extra rep. */
function Round({ onPress, label: a11y, icon, t }: { onPress: () => void; label: string; icon: 'plus' | 'minus'; t: Theme }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      onPress={onPress}
      style={({ pressed }) => [roundStyle(t), { opacity: pressed ? 0.6 : 1 }]}
    >
      <Icon name={icon} color={t.text} size={26} />
    </Pressable>
  );
}

const roundStyle = (t: Theme) =>
  ({ width: 64, height: 64, borderRadius: 32, backgroundColor: t.card, borderWidth: 1, borderColor: t.line, alignItems: 'center', justifyContent: 'center' }) as const;

const styles = (t: Theme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg, paddingHorizontal: 24 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 44 },
    tip: { color: t.dim, fontSize: 16, lineHeight: 23, textAlign: 'center', marginTop: 16, minHeight: 70 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    start: { height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
    startText: { color: '#0B0B0F', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
    controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    done: { flex: 1, height: 64, marginHorizontal: 16, borderRadius: 32, backgroundColor: t.card, borderWidth: 1, borderColor: t.line, alignItems: 'center', justifyContent: 'center' },
    doneText: { fontSize: 18, fontWeight: '800' },
  });

import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Exercise } from '../core/exercises.ts';
import { Icon } from './Icon';
import { leave } from './leave';
import { Ring } from './Ring';
import { label, numeral, tint, type Theme } from './theme';

// Back and mute: 22 pt icons + 14 pt slop on each side = 50 pt touch targets.
const SLOP = 14;

/** Set screen header: back, the exercise name in its color, voice on/off. */
export function SetHeader({ ex, muted, onMute, t }: { ex: Exercise; muted: boolean; onMute: () => void; t: Theme }) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={SLOP} onPress={leave}>
        <Icon name="back" color={t.text} />
      </Pressable>
      <Text style={[label, { color: tint(ex, t) }]}>{ex.name.toUpperCase()}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={muted ? 'Unmute voice' : 'Mute voice'} hitSlop={SLOP} onPress={onMute}>
        <Icon name={muted ? 'mute' : 'sound'} color={t.dim} />
      </Pressable>
    </View>
  );
}

type RingProps = {
  ex: Exercise;
  size: number;
  count: number;
  goal: number;
  countdown: number | null;
  pop: Animated.Value;
  onTap: (() => void) | null;
  t: Theme;
};

/** The big ring: countdown while getting in position, then the count with how many reps are left. */
export function RepRing({ ex, size, count, goal, countdown, pop, onTap, t }: RingProps) {
  const done = count >= goal;
  // Half the ring, never under 160 pt: readable from the floor. Three digits shrink to fit (see below).
  const font = Math.max(160, size * 0.5);
  const big = [numeral, { fontSize: font, lineHeight: font * 1.16 }];
  return (
    <Pressable
      disabled={!onTap}
      onPress={onTap ?? undefined}
      accessibilityRole={onTap ? 'button' : undefined}
      accessibilityLabel={onTap ? `Tap to count a rep. ${count} of ${goal}` : undefined}
      style={styles.center}
    >
      <Ring size={size} stroke={20} progress={count / goal} color={ex.color} track={t.track}>
        {countdown !== null ? (
          <>
            <Text style={[big, { color: t.text }]}>{countdown}</Text>
            <Text style={[label, { color: t.dim }]}>GET IN POSITION</Text>
          </>
        ) : (
          <>
            <Animated.Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[big, { color: done ? tint(ex, t) : t.text, transform: [{ scale: pop }], maxWidth: size - 72 }]}
            >
              {count}
            </Animated.Text>
            <Text style={[label, { color: tint(ex, t), fontSize: 14 }]}>{done ? 'TARGET DONE' : `${goal - count} TO GO`}</Text>
          </>
        )}
      </Ring>
    </Pressable>
  );
}

/** Bottom controls: one big Start before the set, then -1, Done and +1 to fix a miss. */
export function SetControls({ ex, idle, ready, onStart, onBump, t }: {
  ex: Exercise;
  idle: boolean;
  ready: boolean;
  onStart: () => void;
  onBump: (delta: 1 | -1) => void;
  t: Theme;
}) {
  if (idle)
    return (
      <Pressable
        accessibilityRole="button"
        disabled={!ready}
        onPress={onStart}
        style={({ pressed }) => [styles.pill, { backgroundColor: ex.color, opacity: pressed || !ready ? 0.7 : 1 }]}
      >
        <Text style={styles.pillText}>{ready ? 'Start' : 'Checking sensor…'}</Text>
      </Pressable>
    );
  return (
    <View style={styles.controls}>
      <Step icon="minus" label="Remove one rep" onPress={() => onBump(-1)} t={t} />
      <Pressable
        accessibilityRole="button"
        onPress={leave}
        style={({ pressed }) => [styles.pill, styles.done, { backgroundColor: ex.color, opacity: pressed ? 0.8 : 1 }]}
      >
        <Text style={styles.pillText}>Done</Text>
      </Pressable>
      <Step icon="plus" label="Add one rep" onPress={() => onBump(1)} t={t} />
    </View>
  );
}

/** Round ghost ±1 button: fixes a missed or extra rep. */
function Step({ icon, label: a11y, onPress, t }: { icon: 'plus' | 'minus'; label: string; onPress: () => void; t: Theme }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      onPress={onPress}
      style={({ pressed }) => [styles.step, { borderColor: t.line, opacity: pressed ? 0.6 : 1 }]}
    >
      <Icon name={icon} color={t.text} size={26} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pill: { height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  pillText: { color: '#0B0B0F', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  done: { flex: 1 },
  step: { width: 64, height: 64, borderRadius: 32, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});

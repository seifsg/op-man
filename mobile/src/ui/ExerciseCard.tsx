import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Exercise } from '../core/exercises.ts';
import { Icon } from './Icon';
import { Ring } from './Ring';
import { label, numeral, type Theme } from './theme';

type Props = { ex: Exercise; done: number; goal: number; t: Theme; onPress: () => void };

/** Today's card for one exercise: ring, done / target, tap to start a set. */
export function ExerciseCard({ ex, done, goal, t, onPress }: Props) {
  const complete = done >= goal;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${ex.name}: ${done} of ${goal}. Start a set`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: t.card, borderColor: t.line, opacity: pressed ? 0.75 : 1 }]}
    >
      <Ring size={64} stroke={7} progress={done / goal} color={ex.color} track={t.track}>
        {complete ? <Icon name="check" color={ex.color} size={26} /> : <View style={[styles.dot, { backgroundColor: ex.color }]} />}
      </Ring>
      <View style={styles.body}>
        <Text style={[label, { color: ex.color }]}>{ex.name.toUpperCase()}</Text>
        <Text style={[numeral, styles.count, { color: t.text }]}>
          {done}
          <Text style={{ color: t.dim, fontWeight: '700' }}> / {goal}</Text>
        </Text>
      </View>
      <Icon name="chevron" color={t.dim} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, borderWidth: 1, gap: 16 },
  body: { flex: 1, gap: 4 },
  count: { fontSize: 30 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});

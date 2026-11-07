import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EXERCISES } from '../core/exercises.ts';
import { DAYS, dayOn, dayState, goalOn, isOver, streak, timeline } from '../core/plan.ts';
import { useProgress } from '../data/progress';
import { confirmRestart } from '../ui/confirmRestart';
import { ExerciseCard } from '../ui/ExerciseCard';
import { Icon } from '../ui/Icon';
import { label, numeral, useTheme, type Theme } from '../ui/theme';
import { useToday } from '../ui/useToday';

/** Home: which day of 100 it is, the streak, and today's three targets with the next one outlined. */
export default function Home() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { start, days } = useProgress();
  const today = useToday();
  const day = Math.min(dayOn(start, today), DAYS);
  const over = isOver(days, start, today);
  const goal = goalOn(start, today);
  const counts = days[today];
  const run = streak(days, start, today);
  const next = EXERCISES.find((e) => (counts?.[e.id] ?? 0) < goal);
  const s = styles(t);

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, paddingHorizontal: 20, gap: 14 }}>
      <View style={s.top}>
        <Text style={[label, { color: t.text, letterSpacing: 4 }]}>OP MAN</Text>
        <View style={s.chip} accessibilityLabel={`Streak ${run} days`}>
          <Icon name="flame" color={run ? t.accent : t.dim} size={18} fill />
          <Text style={[numeral, { color: t.text, fontSize: 16 }]}>{run}</Text>
        </View>
      </View>

      <View style={s.hero}>
        <Text style={[label, { color: t.dim }]}>{over ? 'CHALLENGE COMPLETE' : dayState(counts, day) === 'done' ? 'TODAY DONE' : 'TODAY'}</Text>
        <Text style={[numeral, s.day]} numberOfLines={1} adjustsFontSizeToFit>
          DAY {day}
          <Text style={{ color: t.dim, fontSize: 30 }}> / {DAYS}</Text>
        </Text>
        <View style={s.bar}>
          <View style={[s.fill, { width: `${(day / DAYS) * 100}%` }]} />
        </View>
        <Text style={s.sub}>
          {over
            ? `${timeline(days, start, today).filter((c) => c === 'done').length} of ${DAYS} days done. Start again any time.`
            : `${goal} of each today. The phone counts every rep.`}
        </Text>
      </View>

      {over && (
        <Pressable accessibilityRole="button" onPress={confirmRestart} style={({ pressed }) => [s.primary, { opacity: pressed ? 0.8 : 1 }]}>
          <Text style={s.primaryText}>Start again</Text>
        </Pressable>
      )}
      {!over &&
        EXERCISES.map((ex) => (
          <ExerciseCard
            key={ex.id}
            ex={ex}
            done={counts?.[ex.id] ?? 0}
            goal={goal}
            next={ex === next}
            t={t}
            onPress={() => router.push({ pathname: '/session/[exercise]', params: { exercise: ex.id } })}
          />
        ))}
      {!over && next && (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/session/[exercise]', params: { exercise: next.id } })}
          style={({ pressed }) => [s.primary, { backgroundColor: next.color, opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={[s.primaryText, { color: '#0B0B0F' }]}>Start {next.name.toLowerCase()}</Text>
        </Pressable>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/history')}
        style={({ pressed }) => [s.link, { opacity: pressed ? 0.75 : 1 }]}
      >
        <Icon name="grid" color={t.text} />
        <Text style={[s.linkText, { color: t.text }]}>History</Text>
        <Icon name="chevron" color={t.dim} />
      </Pressable>
    </ScrollView>
  );
}

const styles = (t: Theme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg },
    top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 36, borderRadius: 18, backgroundColor: t.card, borderWidth: 1, borderColor: t.line },
    hero: { paddingVertical: 18, gap: 8 },
    day: { color: t.text, fontSize: 56, lineHeight: 64 },
    bar: { height: 8, borderRadius: 4, backgroundColor: t.track, overflow: 'hidden' },
    fill: { height: 8, borderRadius: 4, backgroundColor: t.text },
    sub: { color: t.dim, fontSize: 15, marginTop: 4 },
    primary: { height: 60, borderRadius: 30, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' },
    primaryText: { color: t.onAccent, fontSize: 18, fontWeight: '900' },
    link: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderRadius: 24, backgroundColor: t.card, borderWidth: 1, borderColor: t.line, marginTop: 4 },
    linkText: { flex: 1, fontSize: 16, fontWeight: '800' },
  });

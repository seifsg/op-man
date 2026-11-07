import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EXERCISES } from '../core/exercises.ts';
import { DAYS, dayIndex, dayKey, dayState, streak, target } from '../core/plan.ts';
import { useProgress } from '../data/progress';
import { confirmRestart } from '../ui/confirmRestart';
import { ExerciseCard } from '../ui/ExerciseCard';
import { Icon } from '../ui/Icon';
import { label, numeral, useTheme, type Theme } from '../ui/theme';

/** Home: which day of 100 it is, the streak, and today's three targets. */
export default function Home() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { start, days } = useProgress();
  const today = dayKey(new Date());
  const day = start ? dayIndex(start, today) : 1;
  const over = day > DAYS;
  const goal = target(Math.min(day, DAYS));
  const counts = days[today];
  const run = streak(days, start, today);
  const doneToday = !over && dayState(counts, day) === 'done';
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
        <Text style={[label, { color: t.dim }]}>{over ? 'CHALLENGE COMPLETE' : doneToday ? 'TODAY DONE' : 'TODAY'}</Text>
        <Text style={[numeral, s.day]} numberOfLines={1} adjustsFontSizeToFit>
          DAY {Math.min(day, DAYS)}
          <Text style={{ color: t.dim, fontSize: 30 }}> / {DAYS}</Text>
        </Text>
        <View style={s.bar}>
          <View style={[s.fill, { width: `${(Math.min(day, DAYS) / DAYS) * 100}%` }]} />
        </View>
        <Text style={s.sub}>
          {over ? '100 days in the bag. Start again any time.' : `${goal} of each today. The phone counts every rep.`}
        </Text>
      </View>

      {over ? (
        <Pressable accessibilityRole="button" onPress={confirmRestart} style={({ pressed }) => [s.primary, { opacity: pressed ? 0.8 : 1 }]}>
          <Text style={s.primaryText}>Start again</Text>
        </Pressable>
      ) : (
        EXERCISES.map((ex) => (
          <ExerciseCard
            key={ex.id}
            ex={ex}
            done={counts?.[ex.id] ?? 0}
            goal={goal}
            t={t}
            onPress={() => router.push({ pathname: '/session/[exercise]', params: { exercise: ex.id } })}
          />
        ))
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
    chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 34, borderRadius: 17, backgroundColor: t.card, borderWidth: 1, borderColor: t.line },
    hero: { paddingVertical: 18, gap: 8 },
    day: { color: t.text, fontSize: 56, lineHeight: 64 },
    bar: { height: 6, borderRadius: 3, backgroundColor: t.track, overflow: 'hidden' },
    fill: { height: 6, borderRadius: 3, backgroundColor: t.accent },
    sub: { color: t.dim, fontSize: 15, marginTop: 4 },
    primary: { height: 60, borderRadius: 30, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' },
    primaryText: { color: t.onAccent, fontSize: 18, fontWeight: '900' },
    link: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderRadius: 24, backgroundColor: t.card, borderWidth: 1, borderColor: t.line, marginTop: 4 },
    linkText: { flex: 1, fontSize: 16, fontWeight: '800' },
  });

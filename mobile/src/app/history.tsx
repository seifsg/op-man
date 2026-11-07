import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EXERCISES } from '../core/exercises.ts';
import { DAYS, dayOn, dayState, pastDays, streak, timeline, type DayRow } from '../core/plan.ts';
import { useProgress } from '../data/progress';
import { confirmRestart } from '../ui/confirmRestart';
import { DayGrid } from '../ui/DayGrid';
import { Icon } from '../ui/Icon';
import { leave } from '../ui/leave';
import { label, numeral, tint, useTheme, type Theme } from '../ui/theme';
import { useToday } from '../ui/useToday';

/** History: the 100-day grid, the totals, and every challenge day so far (missed ones too), newest first. */
export default function History() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { start, days } = useProgress();
  const today = useToday();
  const cells = timeline(days, start, today);
  const rows = pastDays(days, start, today);
  const s = styles(t);

  return (
    <FlatList
      style={s.screen}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24, paddingHorizontal: 20, gap: 10 }}
      data={rows}
      keyExtractor={(r) => r.key}
      ListHeaderComponent={
        <View style={{ gap: 18, marginBottom: 8 }}>
          <View style={s.header}>
            <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={14} onPress={leave}>
              <Icon name="back" color={t.text} />
            </Pressable>
            <Text style={[label, { color: t.text, letterSpacing: 4 }]}>HISTORY</Text>
            <View style={{ width: 22 }} />
          </View>
          <View style={s.stats}>
            <Stat value={cells.filter((c) => c === 'done').length} caption="DAYS DONE" t={t} />
            <Stat value={streak(days, start, today)} caption="STREAK" t={t} />
            <Stat value={Math.max(0, DAYS - dayOn(start, today) + 1)} caption="DAYS LEFT" t={t} />
          </View>
          <DayGrid cells={cells} width={width - 40} t={t} />
          {rows.length ? (
            <View style={s.legend}>
              {EXERCISES.map((ex) => (
                <View key={ex.id} style={s.key}>
                  <View style={[s.dot, { backgroundColor: ex.color }]} />
                  <Text style={{ color: t.dim, fontSize: 14, fontWeight: '700' }}>{ex.name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[s.empty, { color: t.dim }]}>No reps yet. Finish day 1 to light the first square.</Text>
          )}
        </View>
      }
      renderItem={({ item }) => <Day row={item} today={item.key === today} t={t} />}
      ListFooterComponent={
        start ? (
          <Pressable accessibilityRole="button" onPress={confirmRestart} style={({ pressed }) => [s.restart, { opacity: pressed ? 0.7 : 1 }]}>
            <Text style={{ color: t.text, fontWeight: '800' }}>Start the challenge again</Text>
          </Pressable>
        ) : undefined
      }
    />
  );
}

/** A big number with a small caption under it. */
function Stat({ value, caption, t }: { value: number; caption: string; t: Theme }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text style={[numeral, { color: t.text, fontSize: 34 }]}>{value}</Text>
      <Text style={[label, { color: t.dim }]}>{caption}</Text>
    </View>
  );
}

/** One day: its number and date, the three counts in their colors, and done / partial / missed (or today). */
function Day({ row, today, t }: { row: DayRow; today: boolean; t: Theme }) {
  const state = dayState(row.counts, row.day);
  const tag = today && state !== 'done' ? 'TODAY' : state.toUpperCase();
  return (
    <View style={[rowStyle.box, { backgroundColor: t.card, borderColor: today ? t.text : t.line }]}>
      <View style={{ width: 78 }}>
        <Text style={[numeral, { color: t.text, fontSize: 18 }]}>Day {row.day}</Text>
        <Text style={{ color: t.dim, fontSize: 12 }}>{row.key}</Text>
      </View>
      <View style={rowStyle.counts}>
        {EXERCISES.map((ex) => (
          <Text key={ex.id} style={[numeral, { color: tint(ex, t), fontSize: 18 }]} accessibilityLabel={`${ex.name} ${row.counts[ex.id]}`}>
            {row.counts[ex.id]}
          </Text>
        ))}
      </View>
      <Text style={[label, { color: state === 'done' ? t.accent : t.dim }]}>{tag}</Text>
    </View>
  );
}

const rowStyle = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18, borderWidth: 1, gap: 12 },
  counts: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
});

const styles = (t: Theme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48 },
    stats: { flexDirection: 'row' },
    restart: { alignItems: 'center', justifyContent: 'center', height: 52, marginTop: 12, borderRadius: 26, borderWidth: 1.5, borderColor: t.line },
    legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    key: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    empty: { fontSize: 15 },
  });

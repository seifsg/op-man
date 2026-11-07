import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EXERCISES, type Counts } from '../core/exercises.ts';
import { DAYS, dayIndex, dayKey, dayState, streak, timeline } from '../core/plan.ts';
import { useProgress } from '../data/progress';
import { DayGrid } from '../ui/DayGrid';
import { Icon } from '../ui/Icon';
import { leave } from '../ui/leave';
import { label, numeral, useTheme, type Theme } from '../ui/theme';
import { confirmRestart } from '../ui/confirmRestart';

type Row = { key: string; day: number; counts: Counts };

/** History: the 100-day grid, the totals, and every day with reps, newest first. */
export default function History() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { start, days } = useProgress();
  const today = dayKey(new Date());
  const cells = timeline(days, start, today);
  const rows: Row[] = start
    ? Object.keys(days)
        .sort()
        .reverse()
        .map((key) => ({ key, day: dayIndex(start, key), counts: days[key]! }))
        .filter((r) => r.day <= DAYS)
    : [];
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
            <Pressable accessibilityLabel="Back" hitSlop={12} onPress={leave}>
              <Icon name="back" color={t.text} />
            </Pressable>
            <Text style={[label, { color: t.text, letterSpacing: 4 }]}>HISTORY</Text>
            <View style={{ width: 22 }} />
          </View>
          <View style={s.stats}>
            <Stat value={cells.filter((c) => c === 'done').length} caption="DAYS DONE" t={t} />
            <Stat value={streak(days, start, today)} caption="STREAK" t={t} />
            <Stat value={start ? Math.max(0, DAYS - dayIndex(start, today) + 1) : DAYS} caption="DAYS LEFT" t={t} />
          </View>
          <DayGrid cells={cells} width={width - 40} t={t} />
          <Text style={[label, { color: t.dim, marginTop: 6 }]}>{rows.length ? 'EVERY DAY' : 'NO REPS YET. YOUR FIRST SET STARTS DAY 1.'}</Text>
          {rows.length > 0 && (
            <View style={s.legend}>
              {EXERCISES.map((ex) => (
                <View key={ex.id} style={s.key}>
                  <View style={[s.dot, { backgroundColor: ex.color }]} />
                  <Text style={{ color: t.dim, fontSize: 13, fontWeight: '700' }}>{ex.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      }
      renderItem={({ item }) => <DayRow row={item} t={t} />}
      ListFooterComponent={
        start ? (
          <Pressable accessibilityRole="button" onPress={confirmRestart} style={s.restart}>
            <Text style={{ color: t.dim, fontWeight: '700' }}>Start the challenge again</Text>
          </Pressable>
        ) : undefined
      }
    />
  );
}

function Stat({ value, caption, t }: { value: number; caption: string; t: Theme }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text style={[numeral, { color: t.text, fontSize: 34 }]}>{value}</Text>
      <Text style={[label, { color: t.dim, fontSize: 11 }]}>{caption}</Text>
    </View>
  );
}

/** One day: its number, date, the three counts in their colors, and done/partial/missed. */
function DayRow({ row, t }: { row: Row; t: Theme }) {
  const state = dayState(row.counts, row.day);
  return (
    <View style={[rowStyle.box, { backgroundColor: t.card, borderColor: t.line }]}>
      <View style={{ width: 74 }}>
        <Text style={[numeral, { color: t.text, fontSize: 18 }]}>Day {row.day}</Text>
        <Text style={{ color: t.dim, fontSize: 12 }}>{row.key}</Text>
      </View>
      <View style={rowStyle.counts}>
        {EXERCISES.map((ex) => (
          <Text key={ex.id} style={[numeral, { color: ex.color, fontSize: 18 }]} accessibilityLabel={`${ex.name} ${row.counts[ex.id]}`}>
            {row.counts[ex.id]}
          </Text>
        ))}
      </View>
      <Text style={[label, { color: state === 'done' ? t.accent : t.dim, fontSize: 11 }]}>{state.toUpperCase()}</Text>
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 44 },
    stats: { flexDirection: 'row' },
    restart: { alignItems: 'center', padding: 20 },
    legend: { flexDirection: 'row', gap: 16, marginTop: -6 },
    key: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 8, height: 8, borderRadius: 4 },
  });

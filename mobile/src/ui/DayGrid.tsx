import { StyleSheet, View } from 'react-native';
import type { Cell } from '../core/plan.ts';
import type { Theme } from './theme';

const GAP = 6;

/** 100 days as a 10 × 10 grid `width` wide: done solid, partial faded, missed hollow, ahead blank; today (index) ringed. */
export function DayGrid({ cells, today, width, t }: { cells: readonly Cell[]; today: number; width: number; t: Theme }) {
  const size = Math.floor((width - 9 * GAP) / 10);
  return (
    <View
      style={[styles.grid, { width: size * 10 + 9 * GAP }]}
      accessibilityLabel={`${cells.filter((c) => c === 'done').length} of ${cells.length} days done`}
    >
      {cells.map((c, i) => (
        <View
          key={i}
          style={[{ width: size, height: size, borderRadius: size / 4 }, look(c, t), i === today && { borderWidth: 2, borderColor: t.text, opacity: 1 }]}
        />
      ))}
    </View>
  );
}

/** Fill or outline for one cell's state, from the theme. */
const look = (c: Cell, t: Theme) => {
  switch (c) {
    case 'done':
      return { backgroundColor: t.accent };
    case 'partial':
      return { backgroundColor: t.accent, opacity: 0.35 };
    case 'missed':
      return { borderWidth: 1.5, borderColor: t.dim };
    case 'ahead':
      return { backgroundColor: t.track };
  }
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
});

import { EXERCISES, type Counts } from './exercises.ts';

/** Challenge length in days. */
export const DAYS = 100;
const FIRST_TARGET = 10;
const LAST_TARGET = 100;
const MS_PER_DAY = 86_400_000;

/** Reps per exercise on a challenge day: 10 on day 1, rising evenly to 100 on day 100. */
export const target = (day: number): number => {
  if (!Number.isInteger(day) || day < 1 || day > DAYS) throw new RangeError(`day ${day} is outside 1..${DAYS}`);
  return Math.round(FIRST_TARGET + ((LAST_TARGET - FIRST_TARGET) * (day - 1)) / (DAYS - 1));
};

const pad = (n: number): string => String(n).padStart(2, '0');

/** Local calendar date as "YYYY-MM-DD": the key a day's reps are saved under; sorts chronologically. */
export const dayKey = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Day keys as UTC midnights: day math stays exact across DST changes.
const utc = (key: string): number => Date.parse(`${key}T00:00:00Z`);

/** Key of the calendar day `n` days after `key` (negative `n`: before). */
export const shiftKey = (key: string, n: number): string => new Date(utc(key) + n * MS_PER_DAY).toISOString().slice(0, 10);

/** Challenge day number of `key`, day 1 being `start`; a clock set back before the start reads as day 1. */
export const dayIndex = (start: string, key: string): number =>
  Math.max(1, Math.round((utc(key) - utc(start)) / MS_PER_DAY) + 1);

export type DayState = 'done' | 'partial' | 'missed';

/** done: every exercise reached that day's target; partial: some reps; missed: none. */
export const dayState = (counts: Counts | undefined, day: number): DayState => {
  if (!counts) return 'missed';
  const goal = target(day);
  if (EXERCISES.every((e) => counts[e.id] >= goal)) return 'done';
  return EXERCISES.some((e) => counts[e.id] > 0) ? 'partial' : 'missed';
};

/** Consecutive done days ending today, or ending yesterday while today is still open. O(streak). */
export const streak = (days: Readonly<Record<string, Counts>>, start: string | null, today: string): number => {
  if (!start) return 0;
  const done = (key: string): boolean => {
    const day = dayIndex(start, key);
    return key >= start && day <= DAYS && dayState(days[key], day) === 'done';
  };
  let key = done(today) ? today : shiftKey(today, -1);
  let n = 0;
  for (; done(key); key = shiftKey(key, -1)) n++;
  return n;
};

/** How a challenge day looks on the grid: its state once past, today while open, or still ahead. */
export type Cell = DayState | 'today' | 'ahead';

/** All 100 challenge days in order, for the history grid. Before the first rep, today is day 1. */
export const timeline = (days: Readonly<Record<string, Counts>>, start: string | null, today: string): Cell[] => {
  const first = start ?? today;
  const now = dayIndex(first, today);
  return Array.from({ length: DAYS }, (_, i) => {
    const day = i + 1;
    if (day > now) return 'ahead';
    const state = dayState(days[shiftKey(first, i)], day);
    return day === now && state !== 'done' ? 'today' : state;
  });
};

import { EXERCISES, type Counts, type ExerciseId } from './exercises.ts';

/**
 * Everything the app stores, schema v1: the challenge's first day and reps per local day.
 * Invariants: start is null exactly when no rep was ever saved; every day key is ≥ start; counts are ints ≥ 0.
 */
export type Progress = {
  readonly v: 1;
  readonly start: string | null;
  readonly days: Readonly<Record<string, Counts>>;
};

export const EMPTY: Progress = { v: 1, start: null, days: {} };

const ZERO: Counts = { pushup: 0, situp: 0, squat: 0 };
const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isCount = (n: unknown): boolean => Number.isInteger(n) && (n as number) >= 0;
const isCounts = (c: unknown): c is Counts => isRecord(c) && EXERCISES.every((e) => isCount(c[e.id]));

/** Why `d` is not a valid Progress doc, or null when it is. */
const problem = (d: unknown): string | null => {
  if (!isRecord(d) || d.v !== 1) return 'not a v1 progress doc';
  const { start, days } = d;
  if (!isRecord(days)) return 'days is not an object';
  const keys = Object.keys(days);
  if (start === null) return keys.length ? 'days saved without a start' : null;
  if (typeof start !== 'string' || !DAY_KEY.test(start)) return 'bad start day';
  const bad = keys.find((k) => !DAY_KEY.test(k) || k < start || !isCounts(days[k]));
  return bad === undefined ? null : `bad day ${bad}`;
};

/** Reads stored JSON. Missing → empty doc; malformed → empty doc plus the reason, so the caller can log and keep a copy. */
export const parseDoc = (raw: string | null): { doc: Progress; error: string | null } => {
  if (raw === null) return { doc: EMPTY, error: null };
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return { doc: EMPTY, error: `invalid JSON: ${String(e)}` };
  }
  const error = problem(data);
  return error === null ? { doc: data as Progress, error: null } : { doc: EMPTY, error };
};

/**
 * Adds `delta` reps of `ex` on `today`. The first rep starts the challenge; counts never drop below 0.
 * A clock set back before the start moves the start to `today`, keeping every day key ≥ start.
 */
export const withRep = (p: Progress, ex: ExerciseId, delta: 1 | -1, today: string): Progress => {
  const day = p.days[today] ?? ZERO;
  const next = Math.max(0, day[ex] + delta);
  if (next === day[ex]) return p;
  const start = p.start === null || today < p.start ? today : p.start;
  return { v: 1, start, days: { ...p.days, [today]: { ...day, [ex]: next } } };
};

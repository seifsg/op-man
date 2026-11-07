import { useSyncExternalStore } from 'react';
import { EMPTY, parseDoc, withRep, type Progress } from '../core/doc.ts';
import type { ExerciseId } from '../core/exercises.ts';
// No extension: Metro picks kv.web.ts on web, kv.ts on phones.
import { kv } from './kv';

const KEY = 'opman.v1';

/** Loads the saved doc once; an unreadable one is logged and kept under `opman.v1.bad`, never silently lost. */
const load = (): Progress => {
  const raw = kv.get(KEY);
  const { doc, error } = parseDoc(raw);
  if (error !== null) {
    console.error(`OP Man: saved progress unreadable (${error}); copied to ${KEY}.bad, starting fresh`);
    kv.set(`${KEY}.bad`, raw ?? '');
    kv.set(KEY, JSON.stringify(doc));
  }
  return doc;
};

let state = load();
const listeners = new Set<() => void>();

/** Saves `next` synchronously, then notifies screens (Observer). Unchanged docs write nothing. */
const commit = (next: Progress): void => {
  if (next === state) return;
  kv.set(KEY, JSON.stringify(next));
  state = next;
  listeners.forEach((l) => l());
};

export const getProgress = (): Progress => state;

export const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Saves one rep (or one undo) for `ex` on `today`, right away: a killed app loses nothing. */
export const addRep = (ex: ExerciseId, delta: 1 | -1, today: string): void => commit(withRep(state, ex, delta, today));

/** Wipes the challenge to start again from day 1. */
export const restart = (): void => commit(EMPTY);

/** Current progress for a screen, re-rendering on every change. */
export const useProgress = (): Progress => useSyncExternalStore(subscribe, getProgress);

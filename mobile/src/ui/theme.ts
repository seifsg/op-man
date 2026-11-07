import { useColorScheme } from 'react-native';
import type { Exercise } from '../core/exercises.ts';

/** "Night Gym" palette: near-black by default, a light twin for daytime. Exercise colors live in core/exercises. */
export type Theme = {
  readonly light: boolean;
  readonly bg: string;
  readonly card: string;
  readonly text: string;
  /** Body copy that must read from a distance (tips). */
  readonly soft: string;
  readonly dim: string;
  readonly line: string;
  /** Outline of ghost buttons: visible on the background, quieter than text. */
  readonly edge: string;
  readonly track: string;
  readonly accent: string;
  readonly onAccent: string;
};

const dark: Theme = {
  light: false,
  bg: '#0B0B0F',
  card: '#16161C',
  text: '#F5F5F7',
  soft: '#C9C9D2',
  dim: '#9A9AA6',
  line: '#24242D',
  edge: '#3A3A46',
  track: '#22222A',
  accent: '#FF5A36',
  onAccent: '#0B0B0F',
};

const light: Theme = {
  light: true,
  bg: '#F4F4F7',
  card: '#FFFFFF',
  text: '#0B0B0F',
  soft: '#33333C',
  dim: '#62626E',
  line: '#E3E3EA',
  edge: '#C4C4CE',
  track: '#E8E8EE',
  accent: '#F04A26',
  onAccent: '#FFFFFF',
};

export const useTheme = (): Theme => (useColorScheme() === 'light' ? light : dark);

/** The exercise color for text: the bright one on dark, its darker ink on light (WCAG AA). */
export const tint = (ex: Exercise, t: Theme): string => (t.light ? ex.ink : ex.color);

/** Heavy numerals that keep their width while counting. */
export const numeral = { fontWeight: '900', fontVariant: ['tabular-nums'] } as const;

/** Small caps-style labels. */
export const label = { fontSize: 12, fontWeight: '800', letterSpacing: 2 } as const;

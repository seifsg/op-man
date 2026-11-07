import { useColorScheme } from 'react-native';

/** "Night Gym" palette: near-black by default, a light twin for daytime. Exercise colors live in core/exercises. */
export type Theme = {
  readonly bg: string;
  readonly card: string;
  readonly text: string;
  readonly dim: string;
  readonly line: string;
  readonly track: string;
  readonly accent: string;
  readonly onAccent: string;
};

const dark: Theme = {
  bg: '#0B0B0F',
  card: '#16161C',
  text: '#F5F5F7',
  dim: '#8C8C99',
  line: '#24242D',
  track: '#22222A',
  accent: '#FF5A36',
  onAccent: '#0B0B0F',
};

const light: Theme = {
  bg: '#F4F4F7',
  card: '#FFFFFF',
  text: '#0B0B0F',
  dim: '#6A6A76',
  line: '#E3E3EA',
  track: '#E8E8EE',
  accent: '#F04A26',
  onAccent: '#FFFFFF',
};

export const useTheme = (): Theme => (useColorScheme() === 'light' ? light : dark);

/** Heavy numerals that keep their width while counting. */
export const numeral = { fontWeight: '900', fontVariant: ['tabular-nums'] } as const;

/** Small caps-style labels. */
export const label = { fontSize: 12, fontWeight: '800', letterSpacing: 2 } as const;

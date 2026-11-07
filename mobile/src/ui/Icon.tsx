import Svg, { Path } from 'react-native-svg';

// 24×24 stroke paths, drawn here so the app ships no icon font.
const PATHS = {
  back: 'M15 5l-7 7 7 7',
  chevron: 'M9 5l7 7-7 7',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  sound: 'M4 9.5h3.5L12 6v12l-4.5-3.5H4zM15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11',
  mute: 'M4 9.5h3.5L12 6v12l-4.5-3.5H4zM16 9.5l5 5M21 9.5l-5 5',
  flame: 'M12 21.5c-3.9 0-6.5-2.8-6.5-6.4 0-2.9 1.7-5 3.3-6.6.3 1.9 1.2 3 2.4 3.4-.4-3.5.9-6.6 3.4-8.9.4 3.3 2.3 5.3 3.5 7.5.7 1.3 1.1 2.8 1.1 4.6 0 3.6-2.8 6.4-6.4 6.4z',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
} as const;

export type IconName = keyof typeof PATHS;

/** A line icon in `color`; `fill` paints closed shapes such as the flame. */
export function Icon({ name, size = 22, color, fill = false }: { name: IconName; size?: number; color: string; fill?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={PATHS[name]}
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill ? color : 'none'}
      />
    </Svg>
  );
}

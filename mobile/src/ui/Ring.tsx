import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useReduceMotion } from './useReduceMotion';

type Props = {
  size: number;
  stroke: number;
  /** 0..1; values above 1 draw a full ring. */
  progress: number;
  color: string;
  track: string;
  children?: ReactNode;
};

/** Eases a number toward `to` over `ms` (ease-out), one render per frame; `ms` 0 jumps straight there. */
const useTween = (to: number, ms = 450): number => {
  const [value, setValue] = useState(to);
  const current = useRef(to);
  useEffect(() => {
    const from = current.current;
    const start = performance.now();
    let id = 0;
    const step = (now: number) => {
      const p = ms > 0 ? Math.min(1, (now - start) / ms) : 1;
      current.current = from + (to - from) * (1 - (1 - p) ** 3);
      setValue(current.current);
      if (p < 1) id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [to, ms]);
  return value;
};

/** Progress ring that sweeps to its new value; children sit in the middle. */
export function Ring({ size, stroke, progress, color, track, children }: Props) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const shown = useTween(Math.min(1, Math.max(0, progress)), useReduceMotion() ? 0 : 450);
  const c = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={c} cy={c} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        {shown > 0.001 && (
          <Circle
            cx={c}
            cy={c}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - shown)}
            transform={`rotate(-90 ${c} ${c})`}
          />
        )}
      </Svg>
      {children}
    </View>
  );
}

/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { edgeCounter, liftCounter, tiltCounter, type Counter } from './reps.ts';
import type { Vec3 } from './vec.ts';

const HZ = 50;

// Deterministic noise so a failing trace replays exactly.
const rng = (seed: number) => () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31) * 2 - 1;

const unit = (v: Vec3): Vec3 => {
  const n = Math.hypot(v.x, v.y, v.z);
  return { x: v.x / n, y: v.y / n, z: v.z / n };
};

/** Runs a counter over `seconds` of samples from `at(t)` and returns how many reps it reported. */
const count = (counter: Counter<Vec3>, seconds: number, at: (t: number) => Vec3): number => {
  let reps = 0;
  for (let i = 0; i <= seconds * HZ; i++) if (counter(at(i / HZ), i / HZ)) reps++;
  return reps;
};

/**
 * Phone held at a fixed angle (`up` = gravity reaction direction, `sign` = -1 for iOS raw axes),
 * body moving down then up `reps` times with depth `depth` m and period `period` s, after 2.5 s of rest (the countdown).
 */
const squats = (reps: number, depth: number, period: number, up: Vec3, sign = 1, noise = 0.02) => {
  const n = rng(7);
  const u = unit(up);
  const w = (2 * Math.PI) / period;
  return (t: number): Vec3 => {
    const s = t - 2.5;
    const acc = s > 0 && s < reps * period ? (-(depth / 2) * w * w * Math.cos(w * s)) / 9.81 : 0;
    const k = sign * (1 + acc);
    return { x: u.x * k + n() * noise, y: u.y * k + n() * noise, z: u.z * k + n() * noise };
  };
};

/** Torso rotating from lying to `deg` degrees and back `reps` times, after 2.5 s of rest (the countdown). */
const situps = (reps: number, deg: number, period: number, sign = 1, noise = 0.02) => {
  const n = rng(11);
  const w = (2 * Math.PI) / period;
  return (t: number): Vec3 => {
    const s = t - 2.5;
    const th = s > 0 && s < reps * period ? (((deg / 2) * (1 - Math.cos(w * s))) * Math.PI) / 180 : 0;
    return { x: n() * noise, y: sign * Math.sin(th) + n() * noise, z: sign * Math.cos(th) + n() * noise };
  };
};

test('squats count with the phone in hand or on the chest, slow to fast, any OS sign', () => {
  const chest = { x: 0, y: 1, z: 0.2 };
  const hand = { x: 0.1, y: 0.6, z: 0.8 };
  assert.equal(count(liftCounter(), 30, squats(10, 0.45, 2.2, chest)), 10);
  assert.equal(count(liftCounter(), 30, squats(10, 0.45, 2.2, hand, -1)), 10);
  assert.equal(count(liftCounter(), 30, squats(6, 0.35, 4, chest)), 6);
  assert.equal(count(liftCounter(), 30, squats(15, 0.35, 1.2, hand)), 15);
  assert.equal(count(liftCounter(), 30, squats(5, 0.3, 5, chest)), 5);
});

test('squat counter ignores hand tremor, sway and sensor noise while standing still', () => {
  const n = rng(3);
  const tremor = (t: number) => 0.02 * Math.sin(2 * Math.PI * 9 * t) + 0.01 * Math.sin(2 * Math.PI * 6.3 * t);
  const still = (t: number): Vec3 => ({
    x: tremor(t) + n() * 0.005,
    y: 1.02 + 0.002 * Math.sin(2 * Math.PI * 0.3 * t) + n() * 0.005,
    z: tremor(t + 0.1) + n() * 0.005,
  });
  assert.equal(count(liftCounter(), 120, still), 0);
});

test('sit-ups count by torso tilt, any OS sign; small wobble does not count', () => {
  assert.equal(count(tiltCounter(), 40, situps(12, 80, 2.5)), 12);
  assert.equal(count(tiltCounter(), 40, situps(8, 60, 4, -1)), 8);
  assert.equal(count(tiltCounter(), 40, situps(10, 15, 2)), 0);
});

test('push-ups count far → near edges and ignore sensor flicker', () => {
  const c = edgeCounter();
  const events: [boolean, number][] = [
    [true, 1], [false, 1.1], [true, 1.2], [false, 1.9],
    [true, 3], [false, 3.8],
    [true, 5], [false, 5.7],
  ];
  assert.equal(events.filter(([near, t]) => c(near, t)).length, 3);
});

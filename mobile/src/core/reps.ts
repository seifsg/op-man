import { angleDeg, lerp, norm, type Vec3 } from './vec.ts';

/** Feeds one sensor sample at time `t` (seconds); returns true when that sample completes a rep. */
export type Counter<S> = (sample: S, t: number) => boolean;

const G = 9.81;
// Sensor gaps (app paused, dropped samples) must not explode filters: cap each step.
const MAX_DT = 0.1;

/** Seconds since the previous sample, clamped to [0, MAX_DT]; first sample yields 0. */
const stepper = () => {
  let prev: number | null = null;
  return (t: number): number => {
    const dt = prev === null ? 0 : Math.min(MAX_DT, Math.max(0, t - prev));
    prev = t;
    return dt;
  };
};

/**
 * Squats, phone in hand or on the chest: the body goes down, then up.
 * |a| minus the resting |a| is vertical acceleration whatever the phone's angle or OS sign;
 * a leaky integral of it is vertical velocity (m/s). A rep = going down faster than `vDown`, then up faster than `vUp`.
 * The resting |a| is the mean of the first `calibrate` seconds (the user stands still for the countdown),
 * then follows slow sensor drift only, so slow reps are not filtered away.
 */
export const liftCounter = ({
  vDown = 0.1,
  vUp = 0.05,
  minGap = 0.8,
  calibrate = 2,
  tauBase = 20,
  tauVel = 3,
} = {}): Counter<Vec3> => {
  const step = stepper();
  let elapsed = 0;
  let samples = 0;
  let base = 0;
  let vel = 0;
  let down = false;
  let last = -Infinity;
  return (a, t) => {
    const dt = step(t);
    const m = norm(a);
    elapsed += dt;
    if (elapsed < calibrate) {
      base += (m - base) / ++samples;
      return false;
    }
    base += (m - base) * (dt / tauBase);
    vel = vel * (1 - dt / tauVel) + (m - base) * G * dt;
    if (vel < -vDown) down = true;
    else if (down && vel > vUp && t - last >= minGap) {
      down = false;
      last = t;
      return true;
    }
    return false;
  };
};

/**
 * Sit-ups, phone on the chest or in the hands: the torso tilts up, then back.
 * Angle between the smoothed gravity vector and the rest pose; a rep = above `up` degrees, then below `down`.
 * The rest pose is the pose held at the end of the first `calibrate` seconds (lying back for the countdown),
 * then follows slow drift only while lying back.
 */
export const tiltCounter = ({
  up = 45,
  down = 20,
  minGap = 0.8,
  calibrate = 2,
  tauSmooth = 0.15,
  tauRest = 3,
} = {}): Counter<Vec3> => {
  const step = stepper();
  let elapsed = 0;
  let g: Vec3 | null = null;
  let rest: Vec3 | null = null;
  let raised = false;
  let last = -Infinity;
  return (a, t) => {
    const dt = step(t);
    elapsed += dt;
    g = g === null ? a : lerp(g, a, Math.min(1, dt / tauSmooth));
    if (elapsed < calibrate || rest === null) {
      rest = g;
      return false;
    }
    const angle = angleDeg(g, rest);
    if (angle > up) raised = true;
    else if (angle < down) {
      rest = lerp(rest, g, dt / tauRest);
      if (raised && t - last >= minGap) {
        raised = false;
        last = t;
        return true;
      }
    }
    return false;
  };
};

/** Push-ups, phone on the floor: one rep per far → near change, ignoring flicker faster than `minGap`. */
export const edgeCounter = ({ minGap = 0.5 } = {}): Counter<boolean> => {
  let wasNear = false;
  let last = -Infinity;
  return (near, t) => {
    const rep = near && !wasNear && t - last >= minGap;
    wasNear = near;
    if (rep) last = t;
    return rep;
  };
};

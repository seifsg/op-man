/** A 3-axis sensor sample or direction, in g units for the accelerometer. */
export type Vec3 = { readonly x: number; readonly y: number; readonly z: number };

/** Dot product: projects one vector on another. */
export const dot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;

/** Length of a vector: |a| is the total acceleration in g. */
export const norm = (a: Vec3): number => Math.sqrt(dot(a, a));

/** Moves `a` toward `b` by fraction `k`: one step of an exponential moving average. */
export const lerp = (a: Vec3, b: Vec3, k: number): Vec3 => ({
  x: a.x + (b.x - a.x) * k,
  y: a.y + (b.y - a.y) * k,
  z: a.z + (b.z - a.z) * k,
});

/** Angle between two non-zero vectors, in degrees. */
export const angleDeg = (a: Vec3, b: Vec3): number =>
  (Math.acos(Math.min(1, Math.max(-1, dot(a, b) / (norm(a) * norm(b))))) * 180) / Math.PI;

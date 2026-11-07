/** The three challenge exercises: single source of truth for names, colors, sensor and placement tips. */
export type ExerciseId = 'pushup' | 'situp' | 'squat';

/** Reps done per exercise on one day. */
export type Counts = Readonly<Record<ExerciseId, number>>;

/** No reps yet: the counts of an untouched day. */
export const ZERO: Counts = { pushup: 0, situp: 0, squat: 0 };

/** How reps are sensed: proximity edge (push-ups), torso tilt (sit-ups), vertical lift (squats). */
export type Sensor = 'proximity' | 'tilt' | 'lift';

export interface Exercise {
  readonly id: ExerciseId;
  readonly name: string;
  /** Bright ring and accent color. */
  readonly color: string;
  /** Darker twin for text on light backgrounds (WCAG AA). */
  readonly ink: string;
  readonly sensor: Sensor;
  readonly tip: string;
}

export const EXERCISES: readonly Exercise[] = [
  {
    id: 'pushup',
    name: 'Push-ups',
    color: '#FF5A36',
    ink: '#C43A16',
    sensor: 'proximity',
    tip: 'Phone flat on the floor under your face, screen up. Nose close to the top edge on every rep.',
  },
  {
    id: 'situp',
    name: 'Sit-ups',
    color: '#FFC233',
    ink: '#8F5E00',
    sensor: 'tilt',
    tip: 'Hold the phone flat on your chest or in your hands. Lie back still for the countdown, then go.',
  },
  {
    id: 'squat',
    name: 'Squats',
    color: '#3DDC97',
    ink: '#0B7A4B',
    sensor: 'lift',
    tip: 'Hold the phone on your chest or in front of you. Stand still for the countdown, then squat.',
  },
];

/** Looks up an exercise by a route param; undefined for anything that is not one of the three ids. */
export const exerciseById = (id: unknown): Exercise | undefined => EXERCISES.find((e) => e.id === id);

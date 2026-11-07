/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Counts } from './exercises.ts';
import { DAYS, dayIndex, dayKey, dayState, goalOn, isOver, pastDays, shiftKey, streak, target, timeline } from './plan.ts';

const all = (n: number): Counts => ({ pushup: n, situp: n, squat: n });

test('plan ramps 10 → 100 and never goes down', () => {
  assert.equal(target(1), 10);
  assert.equal(target(100), 100);
  for (let d = 2; d <= DAYS; d++) assert.ok(target(d) >= target(d - 1), `day ${d}`);
  for (const bad of [0, 101, 1.5, Number.NaN]) assert.throws(() => target(bad), RangeError);
  assert.equal(goalOn(null, '2026-11-07'), 10);
  assert.equal(goalOn('2026-07-30', '2026-11-07'), 100);
});

test('day keys are local dates and day math ignores DST', () => {
  assert.equal(dayKey(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
  assert.equal(shiftKey('2026-03-01', -1), '2026-02-28');
  assert.equal(shiftKey('2026-12-31', 1), '2027-01-01');
  assert.equal(dayIndex('2026-03-28', '2026-03-30'), 3);
  assert.equal(dayIndex('2026-10-24', '2026-10-26'), 3);
  assert.equal(dayIndex('2026-05-02', '2026-05-01'), 1);
});

test('day state: done needs every exercise at target', () => {
  assert.equal(dayState(all(10), 1), 'done');
  assert.equal(dayState({ pushup: 10, situp: 10, squat: 9 }, 1), 'partial');
  assert.equal(dayState(all(0), 1), 'missed');
  assert.equal(dayState(undefined, 1), 'missed');
});

test('streak counts done days back from today, or from yesterday while today is open', () => {
  const days = { '2026-11-04': all(20), '2026-11-05': all(20), '2026-11-06': all(20), '2026-11-07': all(3) };
  assert.equal(streak(days, '2026-11-04', '2026-11-07'), 3);
  assert.equal(streak({ ...days, '2026-11-07': all(20) }, '2026-11-04', '2026-11-07'), 4);
  assert.equal(streak({ ...days, '2026-11-05': all(10) }, '2026-11-04', '2026-11-07'), 1);
  assert.equal(streak(days, '2026-11-04', '2026-11-08'), 0);
  assert.equal(streak({}, null, '2026-11-07'), 0);
  assert.deepEqual(timeline(days, '2026-11-04', '2026-11-07').slice(0, 5), ['done', 'done', 'done', 'partial', 'ahead']);
  assert.equal(timeline({}, null, '2026-11-07')[0], 'missed');
  assert.deepEqual(pastDays({ '2026-11-05': all(1) }, '2026-11-05', '2026-11-07').map((r) => [r.day, r.counts.pushup]), [[3, 0], [2, 0], [1, 1]]);
  assert.equal(isOver({}, '2026-07-30', '2026-11-06'), false);
  assert.equal(isOver({ '2026-11-06': all(100) }, '2026-07-30', '2026-11-06'), true);
  assert.equal(isOver({}, '2026-07-30', '2026-11-07'), true);
});

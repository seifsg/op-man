/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EMPTY, parseDoc, withRep } from './doc.ts';

test('stored doc round-trips; missing is empty; malformed is rejected with a reason', () => {
  const doc = withRep(withRep(EMPTY, 'squat', 1, '2026-11-07'), 'pushup', 1, '2026-11-08');
  assert.deepEqual(parseDoc(JSON.stringify(doc)), { doc, error: null });
  assert.deepEqual(parseDoc(null), { doc: EMPTY, error: null });
  for (const raw of [
    '{oops',
    '{"v":2,"start":null,"days":{}}',
    '{"v":1,"start":null,"days":{"2026-11-07":{"pushup":1,"situp":0,"squat":0}}}',
    '{"v":1,"start":"2026-11-07","days":{"2026-11-06":{"pushup":1,"situp":0,"squat":0}}}',
    '{"v":1,"start":"2026-11-07","days":{"2026-11-07":{"pushup":-1,"situp":0,"squat":0}}}',
    '{"v":1,"start":"2026-11-07","days":{"2026-11-07":{"pushup":1.5,"situp":0,"squat":0}}}',
  ]) {
    const { doc: d, error } = parseDoc(raw);
    assert.equal(d, EMPTY, raw);
    assert.ok(error, raw);
  }
});

test('first rep starts the challenge; counts never go below zero', () => {
  assert.equal(withRep(EMPTY, 'situp', -1, '2026-11-07'), EMPTY);
  const one = withRep(EMPTY, 'situp', 1, '2026-11-07');
  assert.equal(one.start, '2026-11-07');
  assert.deepEqual(one.days['2026-11-07'], { pushup: 0, situp: 1, squat: 0 });
  assert.deepEqual(withRep(one, 'situp', -1, '2026-11-07').days['2026-11-07'], { pushup: 0, situp: 0, squat: 0 });
  assert.equal(withRep(one, 'pushup', 1, '2026-11-01').start, '2026-11-01');
});

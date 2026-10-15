import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGazeTracker } from '../gaze.js';
import { animals, illustration } from '../animals.js';

function scene(centres = [300]) {
  const values = new Map();
  const frames = new Map();
  const operations = [];
  let nextFrame = 0;
  const tracker = createGazeTracker({
    requestFrame: callback => { frames.set(++nextFrame, callback); return nextFrame; },
    cancelFrame: frame => frames.delete(frame),
  });
  const surface = {
    style: {
      setProperty: (key, value) => { operations.push('write'); values.set(key, value); },
      removeProperty: key => values.delete(key),
    },
    getBoundingClientRect: () => { operations.push('read'); return { width: 400, height: 300 }; },
    querySelectorAll: () => centres.map(x => ({ getBoundingClientRect: () => {
      operations.push('read'); return { left: x - 10, top: 90, width: 20, height: 20 };
    } })),
  };
  const flush = () => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback()); };
  return { ...tracker, surface, values, frames, operations, flush };
}

test('profile animals look relative to their head, even right of the card centre', () => {
  const { updateGaze, resetGaze, surface, values, flush } = scene();
  updateGaze(surface, { clientX: 250, clientY: 50 }); flush();
  assert.ok(parseFloat(values.get('--look-x')) < 0);
  assert.ok(parseFloat(values.get('--look-y')) < 0);
  updateGaze(surface, { clientX: 300, clientY: 100 }); flush();
  assert.equal(parseFloat(values.get('--look-x')), 0);
  assert.equal(parseFloat(values.get('--look-y')), 0);
  updateGaze(surface, { clientX: 10000, clientY: 10000 }); flush();
  assert.ok(parseFloat(values.get('--look-x')) > 0 && parseFloat(values.get('--look-x')) <= 3);
  assert.ok(parseFloat(values.get('--look-y')) > 0 && parseFloat(values.get('--look-y')) <= 2);
  resetGaze(surface);
  assert.equal(values.size, 0);
});

test('paired pupils share one direction and all geometry is read before either axis is written', () => {
  const { updateGaze, surface, values, operations, flush } = scene([250,350]);
  updateGaze(surface, { clientX: 250, clientY: 100 }); flush();
  assert.ok(parseFloat(values.get('--look-x')) < 0, 'both pupils look left, including when the pointer is over one eye');
  assert.deepEqual(operations, ['read','read','read','write','write']);
  updateGaze(surface, { clientX: 300, clientY: 100 }); flush();
  assert.equal(parseFloat(values.get('--look-x')), 0, 'both pupils centre together between the eyes');
});

test('rapid motion uses only the latest position in one frame and responds to reversal immediately', () => {
  const { updateGaze, surface, values, frames, operations, flush } = scene([250,350]);
  for (let i = 0; i < 100; i++) updateGaze(surface, { clientX: 1000, clientY: 100 });
  updateGaze(surface, { clientX: 0, clientY: 100 });
  assert.equal(frames.size, 1);
  assert.equal(operations.length, 0, 'pointer events do not force layout');
  flush();
  assert.ok(parseFloat(values.get('--look-x')) < 0, 'no stale rightward positions are replayed');
  updateGaze(surface, { clientX: 1000, clientY: 100 }); flush();
  assert.ok(parseFloat(values.get('--look-x')) > 0, 'the very next frame follows the new direction');
});

test('lifting a finger or losing window focus cancels pending gaze updates', () => {
  const { updateGaze, resetGaze, surface, values, frames, flush } = scene([250,350]);
  updateGaze(surface, { clientX: 0, clientY: 100 }); flush();
  updateGaze(surface, { clientX: 1000, clientY: 100 });
  resetGaze(surface);
  assert.equal(frames.size, 0);
  flush();
  assert.equal(values.size, 0, 'a pending frame cannot move the eyes after reset');
});

test('every animal has a fixed white and an independent pupil for each eye', () => {
  for (const animal of animals) {
    const svg = illustration(animal);
    const count = className => [...svg.matchAll(new RegExp(`class="${className}"`, 'g'))].length;
    assert.ok(count('eye') > 0, animal.name);
    assert.equal(count('eye-white'), count('eye'), animal.name);
    assert.equal(count('eye-pupil'), count('eye'), animal.name);
    assert.equal(count('pupil'), count('eye'), animal.name);
  }
});

test('tracking resumes immediately after a cancelled frame and ignores a stale callback', () => {
  const callbacks = [];
  const values = new Map();
  const tracker = createGazeTracker({ requestFrame: fn => { callbacks.push(fn); return callbacks.length; }, cancelFrame: () => {} });
  const surface = {
    style: { setProperty: (key, value) => values.set(key, value), removeProperty: key => values.delete(key) },
    getBoundingClientRect: () => ({ width: 400, height: 300 }),
    querySelectorAll: () => [{ getBoundingClientRect: () => ({ left: 290, top: 90, width: 20, height: 20 }) }],
  };
  tracker.updateGaze(surface, { clientX: 0, clientY: 100 });
  tracker.resetGaze(surface);
  tracker.updateGaze(surface, { clientX: 1000, clientY: 100 });
  callbacks[0]();
  assert.equal(values.size, 0, 'cancelled work cannot overwrite a newer position');
  tracker.updateGaze(surface, { clientX: 1200, clientY: 100 });
  assert.equal(callbacks.length, 2, 'stale work cannot remove the current pending frame');
  callbacks[1]();
  assert.ok(parseFloat(values.get('--look-x')) > 0);
});

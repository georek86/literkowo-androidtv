import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAnimalInput, PlayState } from '../play-state.js';
import { animals, animalForKey, AnimalAlbum, illustration, normalizeAnimalKey } from '../animals.js';

test('rapid multi-key input is dropped, with no queued action or repeat storm', () => {
  let now = 0;
  const state = new PlayState({ now: () => now });
  assert.equal(state.accept(), false);
  state.start();
  assert.equal(state.accept(), true);
  for (let i = 0; i < 100; i++) { now += 10; assert.equal(state.accept(), false); }
  now = 2300;
  assert.equal(state.accept({ repeat: true }), false);
  assert.equal(state.accept(), true);
});

test('speech blocks input until it ends, followed by a quiet gap', () => {
  let now = 0;
  const state = new PlayState({ now: () => now });
  state.start();
  state.accept();
  state.speaking = true;
  now = 6000;
  assert.equal(state.accept(), false);
  state.speechEnded();
  now = 6499;
  assert.equal(state.accept(), false);
  now = 6500;
  assert.equal(state.accept(), true);
});

test('paused and finished sessions cannot react, and resume is immediately usable', () => {
  const state = new PlayState({ now: () => 10 });
  state.start();
  state.accept();
  state.stop();
  assert.equal(state.accept(), false);
  state.start();
  assert.equal(state.accept(), true);
});

test('Polish letters map to matching words and all animals have vector illustrations', () => {
  assert.equal(new Set(animals.map(a => a.name)).size, animals.length);
  assert.equal(new Set(animals.map(illustration)).size, animals.length, 'every animal has its own drawing');
  for (const animal of animals) {
    assert.equal(animal.name[0], animal.key);
    assert.match(animal.inputKey, /^[a-z]$/);
    assert.equal(animalForKey(animal.key.toLocaleUpperCase('pl')).inputKey, animal.inputKey);
    const svg = illustration(animal);
    assert.ok(svg.startsWith('<svg'));
    assert.ok(svg.endsWith('</svg>'));
    assert.ok(!svg.includes('undefined'));
  }
  assert.equal(animalForKey('Enter'), undefined);
  assert.equal(animalForKey('ą').name, 'alpaka');
  assert.throws(() => illustration({ kind: 'missing-animal', color: '#ffffff' }), /Brak ilustracji/);
});

test('readiness follows the actual acceptance boundary without early completion', () => {
  let now = 0;
  const state = new PlayState({ now: () => now });
  assert.deepEqual(state.readiness(), { phase: 'inactive', progress: 0 });
  state.start();
  assert.deepEqual(state.readiness(), { phase: 'ready', progress: 1 });
  state.accept();
  assert.deepEqual(state.readiness(), { phase: 'waiting', progress: 0 });
  now = 1100;
  assert.deepEqual(state.readiness(), { phase: 'waiting', progress: .5 });
  assert.equal(state.accept(), false);
  assert.equal(state.readiness().progress, .5, 'rejected keys must not restart progress');
  now = 2199;
  assert.ok(state.readiness().progress < 1);
  assert.equal(state.accept(), false);
  now = 2200;
  assert.deepEqual(state.readiness(), { phase: 'ready', progress: 1 });
  assert.equal(state.accept(), true);
  state.stop();
  assert.deepEqual(state.readiness(), { phase: 'inactive', progress: 0 });
  state.start();
  assert.deepEqual(state.readiness(), { phase: 'ready', progress: 1 });
});

test('indicator waits through short, long, and failed speech, then fills the actual remaining gap', () => {
  for (const speechDuration of [600, 4000, 7000]) {
    let now = 0;
    const state = new PlayState({ now: () => now });
    state.start();
    state.accept();
    state.speaking = true;
    now = speechDuration;
    assert.deepEqual(state.readiness(), { phase: 'speaking', progress: 0 });
    assert.equal(state.accept(), false);
    state.speechEnded();
    assert.deepEqual(state.readiness(), { phase: 'waiting', progress: 0 });
    const gap = Math.max(2200 - speechDuration, 500);
    now += gap / 2;
    assert.equal(state.readiness().progress, .5);
    now += gap / 2;
    assert.deepEqual(state.readiness(), { phase: 'ready', progress: 1 });
    assert.equal(state.accept(), true);
  }
});

function seeded(seed = 12345) {
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}
const makeAlbum = (seed = 12345, initial = animals[0]) => new AnimalAlbum(initial, { random: seeded(seed) });

test('N reaches the rhino alongside both bears and the bat', () => {
  assert.deepEqual(animals.filter(a => a.inputKey === 'n').map(a => a.name).sort(), ['niedźwiedź','niedźwiedź polarny','nietoperz','nosorożec'].sort());
});

test('session starts are random across the whole catalogue and reset avoids the previous animal', () => {
  assert.equal(new AnimalAlbum(undefined, { random: () => 0 }).current, animals[0]);
  assert.equal(new AnimalAlbum(undefined, { random: () => .999999 }).current, animals.at(-1));
  const album = new AnimalAlbum(undefined, { random: seeded() });
  const starts = new Set();
  for (let i = 0; i < 100; i++) {
    const previous = album.current;
    starts.add(album.reset());
    assert.notEqual(album.current, previous);
    assert.ok(animals.includes(album.current));
  }
  assert.ok(starts.size > 30, 'starts must not be pinned to the first animal');
});

test('letter bags shuffle, cover their whole group and avoid repeats across bag boundaries', () => {
  for (const key of new Set(animals.map(a => a.inputKey))) {
    const group = animals.filter(a => a.inputKey === key);
    const album = makeAlbum();
    let previous = album.current;
    for (let cycle = 0; cycle < 5; cycle++) {
      const seen = new Set();
      for (let i = 0; i < group.length; i++) {
        const animal = album.next(key);
        assert.equal(animal.inputKey, key);
        if (group.length > 1) assert.notEqual(animal, previous, key);
        seen.add(animal); previous = animal;
      }
      assert.deepEqual(seen, new Set(group), key);
    }
  }
  const group = animals.filter(a => a.inputKey === 'k');
  const sequence = album => group.map(() => album.next('k'));
  assert.notDeepEqual(sequence(makeAlbum()), group, 'selection must not follow declaration order');
  assert.notDeepEqual(sequence(makeAlbum(1)), sequence(makeAlbum(2)), 'different randomness changes the order');
});

test('letter bags keep unconsumed animals when another group is used', () => {
  const album = makeAlbum();
  const k = [album.next('k')];
  album.next('p'); album.next('p');
  for (let i = 1; i < animals.filter(a => a.inputKey === 'k').length; i++) k.push(album.next('k'));
  assert.equal(new Set(k).size, k.length);
});

test('unassigned keys share a shuffled full-album bag and retain the actual animal initial', () => {
  const album = makeAlbum();
  const keys = [' ', 'Enter', 'ArrowLeft', '7', 'q', 'x', 'Tab', 'Backspace'];
  let previous = album.current;
  for (let cycle = 0; cycle < 3; cycle++) {
    const seen = new Set();
    for (let i = 0; i < animals.length; i++) {
      const animal = album.next(keys[i % keys.length]);
      assert.notEqual(animal, previous);
      assert.equal(animal.name[0], animal.key);
      seen.add(animal); previous = animal;
    }
    assert.equal(seen.size, animals.length);
  }
});

test('mixing pools avoids repeats whenever another matching animal is available', () => {
  const album = makeAlbum();
  let previous = album.current;
  for (let i = 0; i < 1500; i++) {
    const animal = album.next(i % 3 ? previous.inputKey : ' ');
    if (animals.filter(a => a.inputKey === previous.inputKey).length > 1 || i % 3 === 0) assert.notEqual(animal, previous);
    previous = animal;
  }
  const initial = animalForKey('n');
  album.reset(initial);
  assert.equal(album.current, initial);
  assert.notEqual(album.next('n'), initial);
});

test('rapid, held and speech-blocked keys do not consume animals or randomness', () => {
  let now = 0;
  const state = new PlayState({ now: () => now });
  const album = makeAlbum();
  const reference = makeAlbum();
  state.start();
  const input = (key, repeat = false) => {
    if (isAnimalInput({ key }) && state.accept({ repeat })) return album.next(key);
    return null;
  };
  assert.equal(input('k'), reference.next('k'));
  for (const key of ['k','k','p',' ', 'q']) assert.equal(input(key), null);
  now = 2200;
  assert.equal(input('k', true), null);
  assert.equal(input('k'), reference.next('k'));
  now = 4400;
  assert.equal(input('p'), reference.next('p'));
  state.speaking = true;
  now = 8000;
  assert.equal(input(' '), null);
  state.speechEnded();
  now = 8500;
  assert.equal(input('Enter'), reference.next('Enter'));
});

test('modifier keys and shortcuts stay separate from discovery, including Polish input', () => {
  for (const key of ['Shift','Control','Alt','AltGraph','Meta','Fn','Escape','Dead','Process']) assert.equal(isAnimalInput({ key }), false);
  for (const key of [' ', 'Enter', 'ArrowDown', 'q', '1', 'CapsLock']) assert.equal(isAnimalInput({ key }), true);
  assert.equal(isAnimalInput({ key: 'p', ctrlKey: true }), false);
  assert.equal(isAnimalInput({ key: 'l', metaKey: true }), false);
  assert.equal(isAnimalInput({ key: 'Tab', altKey: true }), false);
  assert.equal(isAnimalInput({ key: 'ż', ctrlKey: true, altKey: true, getModifierState: key => key === 'AltGraph' }), true);
  assert.equal(isAnimalInput({ key: 'ł', altKey: true }), true);
});


test('ASCII keys reach every animal and accented aliases share the same shuffled bag', () => {
  const aliases = { ą:'a', ć:'c', ę:'e', ł:'l', ń:'n', ó:'o', ś:'s', ź:'z', ż:'z' };
  for (const [accent, ascii] of Object.entries(aliases)) {
    assert.equal(normalizeAnimalKey(accent.toUpperCase()), ascii);
    const album = makeAlbum(), reference = makeAlbum();
    const group = animals.filter(a => a.inputKey === ascii);
    const seen = new Set();
    for (let i = 0; i < group.length * 3; i++) {
      const animal = album.next(i % 2 ? accent.toUpperCase() : ascii);
      assert.equal(animal, reference.next(ascii));
      seen.add(animal);
    }
    assert.equal(seen.size, group.length);
  }
  assert.equal(normalizeAnimalKey('S\u0301'), 's');
  const seen = new Set();
  for (const key of 'abcdefghijklmnopqrstuvwxyz') {
    const album = makeAlbum();
    const group = animals.filter(a => a.inputKey === key);
    for (let i = 0; i < group.length; i++) seen.add(album.next(key));
  }
  assert.equal(seen.size, animals.length, 'no animal requires AltGr');
});

test('a letter with one familiar animal continues to return it without an empty choice', () => {
  const album = makeAlbum();
  for (const key of ['e','i','u']) {
    for (let i = 0; i < 5; i++) assert.equal(album.next(key), animalForKey(key));
  }
});

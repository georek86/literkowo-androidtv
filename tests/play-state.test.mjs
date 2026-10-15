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

test('letter groups cycle in a fixed order and remember their position independently', () => {
  const album = new AnimalAlbum();
  assert.equal(album.next('K').name, 'kot');
  assert.equal(album.next('k').name, 'kaczka');
  assert.equal(album.next('P').name, 'pies');
  assert.equal(album.next('k').name, 'krowa');
  assert.equal(album.next('K').name, 'królik');
  assert.equal(album.next('k').name, 'koza');
  assert.equal(album.next('k').name, 'koń');
  assert.equal(album.next('k').name, 'krab');
  for (const name of ['koala','kangur','kogut','krokodyl','kameleon','konik morski','kura','kot']) assert.equal(album.next('k').name, name);
  assert.equal(album.next('p').name, 'panda');
  assert.equal(album.next('P').name, 'papuga');
  assert.equal(album.next('p').name, 'pingwin');
  assert.equal(album.next('p').name, 'pszczoła');
  assert.equal(album.next('p').name, 'paw');
  assert.equal(album.next('p').name, 'pies');
  assert.deepEqual(['s','s','s','s','s','s','s'].map(key => album.next(key).name), ['sowa','słoń','sarna','ślimak','szop','surykatka','sowa']);
  assert.equal(album.next('Z').name, 'zebra');
  assert.equal(album.next('ź').name, 'źrebak');
  assert.equal(album.next('Ż').name, 'żaba');
  assert.equal(album.next('ż').name, 'żółw');
  assert.equal(album.next('ż').name, 'żyrafa');
  assert.equal(album.next('ż').name, 'zebra');
  assert.equal(album.next('Ś').name, 'słoń');
  album.reset();
  assert.equal(album.next('K').name, 'kot');
});

test('unassigned keys walk the whole album and retain the real animal initial', () => {
  const album = new AnimalAlbum(animals.at(-1));
  const keys = [' ', 'Enter', 'ArrowLeft', '7', 'q', 'x', 'Tab', 'Backspace'];
  for (let index = 0; index <= animals.length; index++) {
    const animal = album.next(keys[index % keys.length]);
    assert.equal(animal, animals[index % animals.length]);
    assert.equal(animal.name[0], animal.key);
  }
  album.reset(animalForKey('k'));
  assert.equal(album.next(' ').name, 'kaczka');
  assert.equal(album.next('k').name, 'krowa', 'letter follows the last variant shown by any key');
});

test('rapid or held keys cannot silently skip animals in either sequence', () => {
  let now = 0;
  const state = new PlayState({ now: () => now });
  const album = new AnimalAlbum();
  state.start();
  const input = (key, repeat = false) => {
    if (isAnimalInput({ key }) && state.accept({ repeat })) return album.next(key).name;
    return null;
  };
  assert.equal(input('k'), 'kot');
  for (const key of ['k','k','p',' ', 'q']) assert.equal(input(key), null);
  now = 2200;
  assert.equal(input('k', true), null);
  assert.equal(input('k'), 'kaczka');
  now = 4400;
  assert.equal(input('p'), 'pies');
  state.speaking = true;
  now = 8000;
  assert.equal(input(' '), null);
  state.speechEnded();
  now = 8500;
  assert.equal(input('Enter'), 'panda');
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


test('ASCII keys reach every animal and accented aliases share one cycle', () => {
  const aliases = { ą:'a', ć:'c', ę:'e', ł:'l', ń:'n', ó:'o', ś:'s', ź:'z', ż:'z' };
  for (const [accent, ascii] of Object.entries(aliases)) {
    assert.equal(normalizeAnimalKey(accent.toUpperCase()), ascii);
  }
  assert.equal(normalizeAnimalKey('S\u0301'), 's');
  const expected = {
    c: ['cykada', 'chomik', 'ćma'],
    l: ['lis', 'lew', 'łoś', 'leniwiec', 'łabędź'],
    s: ['sowa', 'słoń', 'sarna', 'ślimak', 'szop', 'surykatka'],
    z: ['zebra', 'źrebak', 'żaba', 'żółw', 'żyrafa'],
  };
  for (const [key, names] of Object.entries(expected)) {
    const album = new AnimalAlbum();
    assert.deepEqual(names.map(() => album.next(key).name), names);
    assert.equal(album.next(key).name, names[0]);
  }
  const seen = new Set();
  for (const key of 'abcdefghijklmnopqrstuvwxyz') {
    const album = new AnimalAlbum();
    if (!animalForKey(key)) continue;
    for (let i = 0; i < animals.length; i++) seen.add(album.next(key).name);
  }
  assert.equal(seen.size, animals.length, 'no animal requires AltGr');
  const album = new AnimalAlbum();
  assert.deepEqual(['z','Ź','ż','Z','Ż','ź'].map(key => album.next(key).name), ['zebra','źrebak','żaba','żółw','żyrafa','zebra']);
  album.reset(animals.find(a => a.name === 'zebra'));
  assert.equal(album.next(' ').name, 'źrebak');
  assert.equal(album.next('z').name, 'żaba', 'album navigation remembers the ASCII group');
});

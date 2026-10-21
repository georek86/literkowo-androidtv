import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAnimalInput } from '../play-state.js';
import { animalForKey, normalizeAnimalKey } from '../animals.js';

test('Android TV remote media and system keys are ignored during animal play', () => {
  const ignoredKeys = [
    'AudioVolumeUp', 'AudioVolumeDown', 'AudioVolumeMute',
    'VolumeUp', 'VolumeDown', 'VolumeMute',
    'MediaPlayPause', 'MediaStop', 'MediaTrackNext', 'MediaTrackPrevious',
    'MediaFastForward', 'MediaRewind',
    'ChannelUp', 'ChannelDown', 'Power',
    'GoBack', 'BrowserBack', 'Escape'
  ];
  for (const key of ignoredKeys) {
    assert.equal(isAnimalInput({ key }), false, `Key ${key} should not trigger an animal discovery`);
  }
});

test('Android TV physical keyboard with Polish layout shortcuts is recognized', () => {
  // Test Polish characters typed with AltGr or simulated Ctrl+Alt on Android physical keyboards
  const polishLetters = ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'];
  for (const char of polishLetters) {
    // Normal input
    assert.equal(isAnimalInput({ key: char }), true);
    // Right Alt without explicit AltGraph modifier state
    assert.equal(isAnimalInput({ key: char, altKey: true }), true);
    // Emulated AltGr via Ctrl+Alt without explicit AltGraph modifier
    assert.equal(isAnimalInput({ key: char, altKey: true, ctrlKey: true }), true);
    // Explicit AltGraph
    assert.equal(isAnimalInput({ key: char, altKey: true, ctrlKey: true, getModifierState: k => k === 'AltGraph' }), true);
  }

  // Ensure arbitrary characters with Ctrl or Alt are NOT treated as Polish letters
  assert.equal(isAnimalInput({ key: 'x', ctrlKey: true }), false);
  assert.equal(isAnimalInput({ key: 'a', altKey: true }), false);
  assert.equal(isAnimalInput({ key: 'k', ctrlKey: true, altKey: true }), false);
});

test('Android TV physical keyboard ASCII letters reach Polish animals without requiring AltGr', () => {
  // Even if an Android TV decoder keyboard layout defaults to English (US), all animals remain reachable
  assert.equal(animalForKey('c').name, 'cykada');
  assert.equal(normalizeAnimalKey('c'), normalizeAnimalKey('ć'));
  assert.equal(normalizeAnimalKey('l'), normalizeAnimalKey('ł'));
  assert.equal(normalizeAnimalKey('s'), normalizeAnimalKey('ś'));
  assert.equal(normalizeAnimalKey('z'), normalizeAnimalKey('ż'));
  assert.equal(normalizeAnimalKey('z'), normalizeAnimalKey('ź'));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { animals } from '../animals.js';
import { QuizEngine } from '../quiz-engine.js';
import { CollectionManager } from '../collection.js';
import { animalFacts, getFactForAnimal } from '../animal-facts.js';
import { getLetterPronunciation, POLISH_ALPHABET_NAMES, POLISH_PHONIC_SOUNDS } from '../phonics.js';
import { KeyboardMapHelper } from '../keyboard-map.js';
import { MemoryGame } from '../memory-game.js';
import { playCorrect, playStar, playFanfare, playTryAgain, playClick, playCardUnlock } from '../sfx.js';

test('QuizEngine switches modes and formats questions properly', () => {
  const engine = new QuizEngine(animals);
  assert.equal(engine.mode, 'explore');
  assert.equal(engine.currentQuestion, null);

  // Mode: guess-letter
  const q1 = engine.setMode('guess-letter');
  assert.equal(engine.mode, 'guess-letter');
  assert.ok(q1.prompt.includes('Gdzie jest'));
  assert.ok(q1.options.includes(q1.targetChar));
  assert.equal(q1.options.length, 3);

  // Correct check
  const correctRes = engine.checkInput(q1.targetChar);
  assert.equal(correctRes.correct, true);
  assert.equal(correctRes.finished, true);

  // Incorrect check
  const wrongChar = q1.options.find(o => o !== q1.targetChar) || 'Z';
  const wrongRes = engine.checkInput(wrongChar === q1.targetChar ? 'Q' : wrongChar);
  assert.equal(wrongRes.correct, false);
});

test('QuizEngine supports phonics mode and pronunciation', () => {
  const engine = new QuizEngine(animals);
  engine.setPhonicsMode('phonics');
  const q = engine.setMode('guess-letter');
  assert.ok(q.prompt.includes('głoska'));

  assert.equal(getLetterPronunciation('k', 'phonics'), 'k');
  assert.equal(getLetterPronunciation('k', 'alphabet'), 'Ka');
  assert.equal(getLetterPronunciation('b', 'phonics'), 'b');
  assert.equal(getLetterPronunciation('b', 'alphabet'), 'Be');
});

test('QuizEngine first-letter mode matches animal initial with letter', () => {
  const engine = new QuizEngine(animals);
  const q = engine.setMode('first-letter');
  assert.equal(engine.mode, 'first-letter');
  assert.ok(q.prompt.includes(q.animal.name));
  assert.ok(q.options.includes(q.targetChar));

  const res = engine.checkInput(q.targetChar);
  assert.equal(res.correct, true);
  assert.equal(res.finished, true);
  assert.equal(res.animal.name, q.animal.name);
});

test('QuizEngine spelling mode processes words letter by letter', () => {
  const engine = new QuizEngine(animals);
  const q = engine.setMode('spelling');
  assert.equal(engine.mode, 'spelling');
  assert.ok(q.letters.length >= 3);
  assert.equal(q.stepIndex, 0);

  // Type wrong letter
  const wrongRes = engine.checkInput('9');
  assert.equal(wrongRes.correct, false);
  assert.equal(q.stepIndex, 0);

  // Type letters sequentially until complete
  for (let i = 0; i < q.letters.length; i++) {
    const isLast = i === q.letters.length - 1;
    const res = engine.checkInput(q.letters[i]);
    assert.equal(res.correct, true);
    assert.equal(res.finished, isLast);
  }
});

test('QuizEngine supports spelling personalized child name', () => {
  const engine = new QuizEngine(animals);
  engine.setChildName('ZOSIA');
  engine.spellingCount = 3; // next will be round 4
  engine.setMode('spelling');
  const q = engine.currentQuestion;
  assert.equal(q.isChildName, true);
  assert.equal(q.word, 'ZOSIA');
  assert.deepEqual(q.letters, ['Z', 'O', 'S', 'I', 'A']);

  const r1 = engine.checkInput('Z');
  assert.equal(r1.correct, true);
  assert.equal(r1.finished, false);
});

test('MemoryGame creates shuffled pairs and checks matches', () => {
  const mg = new MemoryGame();
  const cards = mg.start(animals, 3);
  assert.equal(cards.length, 6);

  // Flip card 0
  const flip1 = mg.flip(0);
  assert.equal(flip1.status, 'one-flipped');

  // Find matching pair card
  const c0 = cards[0];
  const matchingIndex = cards.findIndex((c, idx) => idx !== 0 && c.pairId === c0.pairId);
  assert.ok(matchingIndex > 0);

  const flip2 = mg.flip(matchingIndex);
  assert.equal(flip2.status, 'match');
  assert.equal(cards[0].matched, true);
  assert.equal(cards[matchingIndex].matched, true);
});

test('MemoryGame handles mismatch and resolveMismatch', () => {
  const mg = new MemoryGame();
  const cards = mg.start(animals, 3);
  const c0 = cards[0];
  const mismatchIndex = cards.findIndex(c => c.pairId !== c0.pairId);

  mg.flip(0);
  const res = mg.flip(mismatchIndex);
  assert.equal(res.status, 'mismatch');
  assert.equal(mg.isLocked, true);

  mg.resolveMismatch();
  assert.equal(mg.isLocked, false);
  assert.equal(cards[0].flipped, false);
  assert.equal(cards[mismatchIndex].flipped, false);
});

test('CollectionManager supports multiple profiles, child settings, night mode, and hints', () => {
  const col = new CollectionManager(animals);
  assert.equal(col.getActiveProfileId(), 'profile_1');

  col.setChildName('Staś');
  assert.equal(col.getChildName(), 'Staś');

  col.addStar();
  assert.equal(col.getStars(), 1);

  // Night mode and keyboard hint
  assert.equal(col.isNightMode(), false);
  col.setNightMode(true);
  assert.equal(col.isNightMode(), true);

  assert.equal(col.isKeyboardHint(), true);
  col.setKeyboardHint(false);
  assert.equal(col.isKeyboardHint(), false);

  // Phonics mode
  assert.equal(col.getPhonicsMode(), 'alphabet');
  col.setPhonicsMode('phonics');
  assert.equal(col.getPhonicsMode(), 'phonics');

  // Stats recording
  col.recordAnswer('k', true);
  col.recordAnswer('k', true);
  col.recordAnswer('m', false);
  const stats = col.getStatsSummary();
  const kStat = stats.find(s => s.letter === 'k');
  assert.equal(kStat.status, 'mastered');
  assert.equal(kStat.rate, 100);

  // Switch to profile_2
  col.switchProfile('profile_2');
  assert.equal(col.getActiveProfileId(), 'profile_2');
  assert.equal(col.getStars(), 0);
  assert.equal(col.getChildName(), '');

  // Switch back to profile_1
  col.switchProfile('profile_1');
  assert.equal(col.getStars(), 1);
  assert.equal(col.getChildName(), 'Staś');
});

test('Every animal has educational trivia facts in Polish', () => {
  for (const animal of animals) {
    const fact = getFactForAnimal(animal);
    assert.ok(typeof fact === 'string' && fact.length > 10, `Animal ${animal.name} should have a trivia fact`);
  }
});

test('SFX functions execute safely in non-browser / headless contexts', () => {
  assert.doesNotThrow(() => {
    playCorrect();
    playStar();
    playFanfare();
    playTryAgain();
    playClick();
    playCardUnlock();
  });
});

test('Phonics dictionary covers Polish letters and provides distinctive sounds', () => {
  assert.equal(POLISH_PHONIC_SOUNDS['b'], 'b');
  assert.equal(POLISH_ALPHABET_NAMES['b'], 'Be');
  assert.equal(POLISH_PHONIC_SOUNDS['ł'], 'ł');
  assert.equal(POLISH_ALPHABET_NAMES['ł'], 'Eł');
  assert.equal(POLISH_PHONIC_SOUNDS['ż'], 'ż');
  assert.equal(POLISH_ALPHABET_NAMES['ż'], 'Żet');
});

test('KeyboardMapHelper operates safely in headless environments', () => {
  const helper = new KeyboardMapHelper(null);
  assert.equal(helper.enabled, true);
  helper.setEnabled(false);
  assert.equal(helper.enabled, false);
  assert.doesNotThrow(() => {
    helper.highlightTarget('A');
    helper.clearTarget();
    helper.flashPress('B');
  });
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { animals } from '../animals.js';
import { QuizEngine } from '../quiz-engine.js';
import { CollectionManager } from '../collection.js';
import { animalFacts, getFactForAnimal } from '../animal-facts.js';
import { playCorrect, playStar, playFanfare, playTryAgain, playClick, playCardUnlock } from '../sfx.js';

test('QuizEngine switches modes and formats questions properly', () => {
  const engine = new QuizEngine(animals);
  assert.equal(engine.mode, 'explore');
  assert.equal(engine.currentQuestion, null);

  // Mode: guess-letter
  const q1 = engine.setMode('guess-letter');
  assert.equal(engine.mode, 'guess-letter');
  assert.ok(q1.prompt.includes('Gdzie jest literka'));
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

test('CollectionManager unlocks cards and tracks letter learning stats', () => {
  const col = new CollectionManager(animals);
  const initialCards = col.getUnlockedCount();
  assert.ok(initialCards >= 3);

  // Adding stars unlocks new cards
  const { stars, unlockedAnimal } = col.addStar();
  assert.equal(stars, 1);
  const res2 = col.addStar();
  assert.equal(res2.stars, 2);
  assert.ok(col.getUnlockedCount() >= initialCards);

  // Recording stats
  col.recordAnswer('k', true);
  col.recordAnswer('k', true);
  col.recordAnswer('b', false);

  const stats = col.getStatsSummary();
  const kStat = stats.find(s => s.letter === 'k');
  assert.equal(kStat.status, 'mastered');
  assert.equal(kStat.correct, 2);
  assert.equal(kStat.total, 2);

  const bStat = stats.find(s => s.letter === 'b');
  assert.equal(bStat.status, 'learning');
  assert.equal(bStat.correct, 0);
  assert.equal(bStat.total, 1);
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

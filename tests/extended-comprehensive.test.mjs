import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { animals, illustration } from '../animals.js';
import { QuizEngine } from '../quiz-engine.js';
import { CollectionManager } from '../collection.js';
import { animalFacts, getFactForAnimal } from '../animal-facts.js';
import { getLetterPronunciation, POLISH_ALPHABET_NAMES, POLISH_PHONIC_SOUNDS } from '../phonics.js';
import { KeyboardMapHelper } from '../keyboard-map.js';
import { MemoryGame } from '../memory-game.js';
import { hasAnimalSound, playAnimalSound, ANIMALS_WITH_SOUNDS } from '../animal-sounds.js';
import { splitIntoSyllables, getSyllablesForAnimal, ANIMAL_SYLLABLES } from '../syllables.js';
import { getFoodForAnimal } from '../animal-feed.js';
import { playCorrect, playStar, playFanfare, playTryAgain, playClick, playCardUnlock, playMunch, playMagicReveal } from '../sfx.js';

test('Extended: Every animal in catalog has valid metadata, SVG illustration, and habitat', () => {
  assert.ok(animals.length >= 32, 'Catalog should contain full Polish alphabet coverage');
  const seenNames = new Set();

  for (const animal of animals) {
    assert.ok(animal.key && animal.key.length === 1, `Animal ${animal.name} must have a 1-char key`);
    assert.ok(animal.name && animal.name.length >= 2, `Animal key ${animal.key} must have a valid Polish name`);
    assert.ok(animal.inputKey && animal.inputKey.length === 1, `Animal ${animal.name} must have an ASCII input key`);
    assert.ok(!seenNames.has(animal.name), `Duplicate animal name detected: ${animal.name}`);
    seenNames.add(animal.name);

    // Vector SVG rendering
    const svgNoScenery = illustration(animal, { scenery: false });
    assert.ok(svgNoScenery.startsWith('<svg') && svgNoScenery.endsWith('</svg>'), `Invalid SVG for ${animal.name}`);
    assert.ok(svgNoScenery.includes('viewBox'), `SVG for ${animal.name} must contain viewBox`);

    const svgWithScenery = illustration(animal, { scenery: true });
    assert.ok(svgWithScenery.startsWith('<svg') && svgWithScenery.endsWith('</svg>'), `Invalid SVG with scenery for ${animal.name}`);
  }
});

test('Extended: Every animal has educational trivia facts, syllables, and food treats', () => {
  for (const animal of animals) {
    // Trivia fact
    const fact = getFactForAnimal(animal);
    assert.ok(typeof fact === 'string' && fact.length >= 15, `Trivia fact for ${animal.name} is too short or missing`);
    assert.ok(!fact.includes('undefined'), `Trivia fact for ${animal.name} contains undefined`);

    // Syllables
    const syllables = getSyllablesForAnimal(animal);
    assert.ok(Array.isArray(syllables) && syllables.length >= 1, `Syllables missing for ${animal.name}`);
    assert.equal(syllables.join('').toLocaleLowerCase('pl'), animal.name.replace(/[^a-ząćęłńóśźż]/gi, '').toLocaleLowerCase('pl'));

    // Food treat
    const food = getFoodForAnimal(animal);
    assert.ok(food.foodKey && food.label && food.speech && food.svg, `Food item incomplete for ${animal.name}`);
    assert.ok(food.svg.includes('<svg') && food.svg.includes('</svg>'), `Food SVG invalid for ${animal.name}`);
  }
});

test('Extended: Complete Polish phonics and alphabet coverage for all 32 letters', () => {
  const polishAlphabet = [
    'a', 'ą', 'b', 'c', 'ć', 'd', 'e', 'ę', 'f', 'g',
    'h', 'i', 'j', 'k', 'l', 'ł', 'm', 'n', 'ń', 'o',
    'ó', 'p', 'r', 's', 'ś', 't', 'u', 'w', 'y', 'z',
    'ź', 'ż'
  ];

  for (const char of polishAlphabet) {
    assert.ok(POLISH_ALPHABET_NAMES[char], `Missing alphabet name for ${char}`);
    assert.ok(POLISH_PHONIC_SOUNDS[char], `Missing phonic sound for ${char}`);

    const phonicRes = getLetterPronunciation(char, 'phonics');
    const alphaRes = getLetterPronunciation(char, 'alphabet');
    assert.ok(phonicRes && phonicRes.length >= 1);
    assert.ok(alphaRes && alphaRes.length >= 1);

    // Case insensitivity
    assert.equal(getLetterPronunciation(char.toUpperCase(), 'phonics'), phonicRes);
    assert.equal(getLetterPronunciation(char.toUpperCase(), 'alphabet'), alphaRes);
  }
});

test('Extended: QuizEngine runs all 8 educational modes flawlessly', () => {
  const engine = new QuizEngine(animals);

  // 1. Explore mode
  assert.equal(engine.setMode('explore'), null);
  assert.equal(engine.mode, 'explore');

  // 2. Guess-letter mode
  const qGuess = engine.setMode('guess-letter');
  assert.equal(qGuess.type, 'guess-letter');
  assert.equal(qGuess.options.length, 3);
  assert.ok(qGuess.options.includes(qGuess.targetChar));
  assert.equal(engine.checkInput(qGuess.targetChar).correct, true);

  // 3. First-letter mode
  const qFirst = engine.setMode('first-letter');
  assert.equal(qFirst.type, 'first-letter');
  assert.ok(qFirst.prompt.includes(qFirst.animal.name));
  assert.equal(engine.checkInput(qFirst.targetChar).correct, true);

  // 4. Spelling mode
  const qSpell = engine.setMode('spelling');
  assert.equal(qSpell.type, 'spelling');
  assert.ok(qSpell.letters.length >= 2);
  let spellRes;
  for (const char of qSpell.letters) {
    spellRes = engine.checkInput(char);
    assert.equal(spellRes.correct, true);
  }
  assert.equal(spellRes.finished, true);

  // 5. Memory mode
  assert.equal(engine.setMode('memory'), null);

  // 6. Shadow mode
  const qShadow = engine.setMode('shadow');
  assert.equal(qShadow.type, 'shadow');
  assert.ok(qShadow.prompt.includes('cieniu'));
  assert.equal(engine.checkInput(qShadow.targetChar).correct, true);

  // 7. Sound mode
  const qSound = engine.setMode('sound');
  assert.equal(qSound.type, 'sound');
  assert.ok(qSound.prompt.includes('dźwięk'));
  assert.equal(engine.checkInput(qSound.targetChar).correct, true);

  // 8. Syllables mode
  const qSyl = engine.setMode('syllables');
  assert.equal(qSyl.type, 'syllables');
  assert.ok(qSyl.syllables.length >= 2);
  let sylRes;
  for (const syl of qSyl.syllables) {
    sylRes = engine.checkInput(syl);
    assert.equal(sylRes.correct, true);
  }
  assert.equal(sylRes.finished, true);
});

test('Extended: MemoryGame cards generation, flipping, and pair matching integrity', () => {
  const mg = new MemoryGame();
  const pairCount = 4;
  const cards = mg.start(animals, pairCount);
  assert.equal(cards.length, pairCount * 2);

  // Match all pairs sequentially
  for (let pairId = 0; pairId < pairCount; pairId++) {
    const pairCards = cards.map((c, i) => ({ c, i })).filter(item => item.c.pairId === pairId);
    assert.equal(pairCards.length, 2);

    const res1 = mg.flip(pairCards[0].i);
    assert.equal(res1.status, 'one-flipped');

    const res2 = mg.flip(pairCards[1].i);
    assert.equal(res2.status, 'match');
    assert.equal(res2.complete, pairId === pairCount - 1);
  }
  assert.equal(mg.matchedPairsCount, pairCount);
});

test('Extended: CollectionManager multi-profile, star rewards, card unlocks, and stats', () => {
  const col = new CollectionManager(animals);

  // Profile 1 tests
  col.switchProfile('profile_1');
  col.setChildName('Ania');
  assert.equal(col.getChildName(), 'Ania');
  assert.equal(col.getActiveProfile().childName, 'Ania');

  const initialUnlocked = col.getUnlockedCount();
  assert.ok(initialUnlocked >= 3);

  // Earn stars and unlock cards
  for (let s = 0; s < 10; s++) {
    col.addStar();
  }
  assert.equal(col.getStars(), 10);
  assert.ok(col.getUnlockedCount() > initialUnlocked);

  // Letters accuracy stats
  col.recordAnswer('a', true);
  col.recordAnswer('a', true);
  col.recordAnswer('b', false);
  const stats = col.getStatsSummary();
  const statA = stats.find(s => s.letter === 'a');
  assert.equal(statA.status, 'mastered');
  const statB = stats.find(s => s.letter === 'b');
  assert.equal(statB.status, 'learning');

  // Profile 2 isolation
  col.switchProfile('profile_2');
  assert.equal(col.getActiveProfileId(), 'profile_2');
  assert.equal(col.getStars(), 0);
  assert.equal(col.getChildName(), '');
  assert.equal(col.getUnlockedCount(), 3);

  // Return to Profile 1
  col.switchProfile('profile_1');
  assert.equal(col.getStars(), 10);
  assert.equal(col.getChildName(), 'Ania');

  // Night mode and hint persistence
  col.setNightMode(true);
  assert.equal(col.isNightMode(), true);
  col.setNightMode(false);
  assert.equal(col.isNightMode(), false);
});

test('Extended: Animal sounds synthesizers execute safely', () => {
  assert.ok(ANIMALS_WITH_SOUNDS.length >= 10);
  for (const name of ANIMALS_WITH_SOUNDS) {
    assert.equal(hasAnimalSound({ name }), true);
    assert.doesNotThrow(() => playAnimalSound({ name }));
  }
});

test('Extended: DOM and HTML integrity check for index.html', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf-8');

  // Check critical IDs
  const requiredIds = [
    'stage', 'animal-content', 'letter', 'illustration', 'animal-name',
    'feed-btn', 'feed-particle-container', 'quiz-overlay', 'quiz-mode-name',
    'quiz-prompt-text', 'quiz-options', 'spelling-slots', 'syllables-slots',
    'sound-replay-btn', 'memory-board', 'quiz-celebration', 'keyboard-map-container',
    'readiness', 'stage-hint', 'start', 'resume', 'stop', 'welcome', 'finish',
    'paused', 'settings', 'profile-btn', 'night-btn', 'cards-button', 'stars-badge',
    'cards-dialog', 'cards-grid', 'card-detail-dialog', 'letters-mastery-grid'
  ];

  for (const id of requiredIds) {
    assert.ok(html.includes(`id="${id}"`), `index.html is missing required element id="${id}"`);
  }

  // Check all 8 mode pills exist
  const expectedModes = ['explore', 'guess-letter', 'first-letter', 'spelling', 'memory', 'shadow', 'syllables', 'sound'];
  for (const mode of expectedModes) {
    assert.ok(html.includes(`data-mode="${mode}"`), `index.html is missing mode pill for "${mode}"`);
  }
});

test('Extended: Web assets and Android TV assets synchronization check', () => {
  const manifest = readFileSync(new URL('../manifest.webmanifest', import.meta.url), 'utf-8');
  assert.doesNotThrow(() => JSON.parse(manifest), 'manifest.webmanifest must be valid JSON');

  const requiredFiles = [
    'index.html', 'style.css', 'app.js', 'animals.js', 'gaze.js',
    'animal-art.js', 'animals-extended.js', 'animals-more.js', 'habitats.js',
    'play-state.js', 'keyboard-protection.js', 'quiz-engine.js', 'collection.js',
    'animal-facts.js', 'sfx.js', 'phonics.js', 'keyboard-map.js', 'memory-game.js',
    'animal-sounds.js', 'syllables.js', 'animal-feed.js', 'manifest.webmanifest',
    'icon.svg'
  ];

  for (const file of requiredFiles) {
    const rootPath = new URL(`../${file}`, import.meta.url);
    const androidPath = new URL(`../android/app/src/main/assets/${file}`, import.meta.url);
    assert.ok(existsSync(rootPath), `Root file missing: ${file}`);
    assert.ok(existsSync(androidPath), `Android asset missing: ${file}`);
  }
});

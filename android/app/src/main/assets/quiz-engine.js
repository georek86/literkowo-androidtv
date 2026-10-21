// Educational Quiz Engine for Android TV with physical keyboard support
// Modes:
// 1. 'explore' - Free discovery (original mode)
// 2. 'guess-letter' - Audio/visual letter recognition ("Wciśnij literkę M")
// 3. 'first-letter' - Initial sound & letter matching ("Na jaką literę zaczyna się Kot?")
// 4. 'spelling' - Word spelling letter-by-letter ("Napiszmy słowo KOT")

import { normalizeAnimalKey } from './animals.js';

const SHORT_ANIMAL_NAMES = new Set([
  'kot', 'pies', 'lis', 'lew', 'jeż', 'koń', 'rak', 'paw', 'wąż', 'osa',
  'gęś', 'ćma', 'emu', 'łoś', 'foka', 'koza', 'mysz', 'owca', 'orka',
  'ryba', 'sowa', 'żaba', 'żółw', 'szop', 'wilk', 'kura', 'dzik', 'kret'
]);

export class QuizEngine {
  constructor(allAnimals = []) {
    this.allAnimals = allAnimals;
    this.mode = 'explore';
    this.currentQuestion = null;
    this.spellingPool = allAnimals.filter(a => SHORT_ANIMAL_NAMES.has(a.name.toLocaleLowerCase('pl')));
    if (this.spellingPool.length === 0) this.spellingPool = allAnimals.filter(a => a.name.length <= 5);
  }

  setMode(mode) {
    this.mode = mode;
    this.currentQuestion = null;
    if (mode !== 'explore') {
      return this.nextQuestion();
    }
    return null;
  }

  nextQuestion() {
    if (this.mode === 'explore') {
      this.currentQuestion = null;
      return null;
    }

    if (this.mode === 'guess-letter') {
      const animal = this.allAnimals[Math.floor(Math.random() * this.allAnimals.length)];
      const targetChar = animal.key.toLocaleUpperCase('pl');
      const options = this.generateOptions(targetChar);
      this.currentQuestion = {
        type: 'guess-letter',
        animal,
        targetChar,
        targetInputKey: normalizeAnimalKey(animal.key),
        options,
        prompt: `Gdzie jest literka ${targetChar}?`,
        speech: `Gdzie jest literka ${targetChar}? Wciśnij ${targetChar} na klawiaturze.`,
      };
      return this.currentQuestion;
    }

    if (this.mode === 'first-letter') {
      const animal = this.allAnimals[Math.floor(Math.random() * this.allAnimals.length)];
      const targetChar = animal.key.toLocaleUpperCase('pl');
      const options = this.generateOptions(targetChar);
      this.currentQuestion = {
        type: 'first-letter',
        animal,
        targetChar,
        targetInputKey: normalizeAnimalKey(animal.key),
        options,
        prompt: `Na jaką literę zaczyna się ${animal.name}?`,
        speech: `Na jaką literę zaczyna się ${animal.name}?`,
      };
      return this.currentQuestion;
    }

    if (this.mode === 'spelling') {
      const animal = this.spellingPool[Math.floor(Math.random() * this.spellingPool.length)];
      const word = animal.name.toLocaleUpperCase('pl');
      const letters = [...word];
      this.currentQuestion = {
        type: 'spelling',
        animal,
        word,
        letters,
        stepIndex: 0,
        typed: [],
        prompt: `Napisz słowo: ${word}`,
        speech: `Ułóżmy słowo ${word}. Wciśnij literkę ${letters[0]}.`,
      };
      return this.currentQuestion;
    }

    return null;
  }

  generateOptions(targetLetter) {
    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'W', 'Z'];
    const distractors = alphabet.filter(l => l !== targetLetter);
    // Shuffle distractors
    for (let i = distractors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
    }
    const choices = [targetLetter, distractors[0], distractors[1]];
    // Shuffle choices so target isn't always first
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return choices;
  }

  checkInput(rawKey) {
    if (!this.currentQuestion) return null;
    const inputKey = normalizeAnimalKey(rawKey);

    if (this.mode === 'guess-letter' || this.mode === 'first-letter') {
      const isCorrect = inputKey === this.currentQuestion.targetInputKey;
      const target = this.currentQuestion.targetChar;
      const animal = this.currentQuestion.animal;
      return {
        correct: isCorrect,
        finished: isCorrect,
        animal,
        letter: target,
        prompt: isCorrect ? `Brawo! To literka ${target}!` : `Spróbuj jeszcze raz. Gdzie jest ${target}?`,
        speech: isCorrect ? `Brawo! Literka ${target}! Jak ${animal.name}!` : `Spróbuj jeszcze raz. Wciśnij literkę ${target}.`,
      };
    }

    if (this.mode === 'spelling') {
      const expectedChar = this.currentQuestion.letters[this.currentQuestion.stepIndex];
      const expectedInputKey = normalizeAnimalKey(expectedChar);
      const isCorrect = inputKey === expectedInputKey;

      if (!isCorrect) {
        return {
          correct: false,
          finished: false,
          animal: this.currentQuestion.animal,
          letter: expectedChar,
          prompt: `Wciśnij literkę ${expectedChar}`,
          speech: `Spróbuj jeszcze raz. Następna literka to ${expectedChar}.`,
        };
      }

      this.currentQuestion.stepIndex++;
      this.currentQuestion.typed.push(expectedChar);
      const finished = this.currentQuestion.stepIndex >= this.currentQuestion.letters.length;

      if (finished) {
        return {
          correct: true,
          finished: true,
          animal: this.currentQuestion.animal,
          word: this.currentQuestion.word,
          prompt: `Wspaniale! Słowo ${this.currentQuestion.word}!`,
          speech: `Wspaniale! Ułożyłeś słowo ${this.currentQuestion.word}!`,
        };
      }

      const nextExpected = this.currentQuestion.letters[this.currentQuestion.stepIndex];
      return {
        correct: true,
        finished: false,
        animal: this.currentQuestion.animal,
        stepIndex: this.currentQuestion.stepIndex,
        prompt: `Napisz słowo: ${this.currentQuestion.word}`,
        speech: `Świetnie! Teraz wciśnij ${nextExpected}.`,
      };
    }

    return null;
  }
}

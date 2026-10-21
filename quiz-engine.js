// Educational Quiz Engine for Android TV with physical keyboard support
// Modes:
// 1. 'explore' - Free discovery (original mode)
// 2. 'guess-letter' - Audio/visual letter recognition ("Wciśnij literkę M" / "Wskaż głoskę M")
// 3. 'first-letter' - Initial sound & letter matching ("Na jaką literę zaczyna się Kot?")
// 4. 'spelling' - Word spelling letter-by-letter ("Napiszmy słowo KOT" lub imię dziecka)
// 5. 'memory' - Memory card matching mode

import { normalizeAnimalKey } from './animals.js';
import { getLetterPronunciation } from './phonics.js';

const SHORT_ANIMAL_NAMES = new Set([
  'kot', 'pies', 'lis', 'lew', 'jeż', 'koń', 'rak', 'paw', 'wąż', 'osa',
  'gęś', 'ćma', 'emu', 'łoś', 'foka', 'koza', 'mysz', 'owca', 'orka',
  'ryba', 'sowa', 'żaba', 'żółw', 'szop', 'wilk', 'kura', 'dzik', 'kret'
]);

export class QuizEngine {
  constructor(allAnimals = []) {
    this.allAnimals = allAnimals;
    this.mode = 'explore';
    this.phonicsMode = 'alphabet'; // 'alphabet' | 'phonics'
    this.childName = '';
    this.spellingCount = 0;
    this.currentQuestion = null;
    this.spellingPool = allAnimals.filter(a => SHORT_ANIMAL_NAMES.has(a.name.toLocaleLowerCase('pl')));
    if (this.spellingPool.length === 0) this.spellingPool = allAnimals.filter(a => a.name.length <= 5);
  }

  setMode(mode) {
    this.mode = mode;
    this.currentQuestion = null;
    if (mode !== 'explore' && mode !== 'memory') {
      return this.nextQuestion();
    }
    return null;
  }

  setPhonicsMode(mode) {
    this.phonicsMode = mode === 'phonics' ? 'phonics' : 'alphabet';
  }

  setChildName(name) {
    this.childName = (name || '').trim();
  }

  nextQuestion() {
    if (this.mode === 'explore' || this.mode === 'memory') {
      this.currentQuestion = null;
      return null;
    }

    if (this.mode === 'guess-letter') {
      const animal = this.allAnimals[Math.floor(Math.random() * this.allAnimals.length)];
      const targetChar = animal.key.toLocaleUpperCase('pl');
      const sound = getLetterPronunciation(targetChar, this.phonicsMode);
      const isPhonic = this.phonicsMode === 'phonics';
      const options = this.generateOptions(targetChar);

      this.currentQuestion = {
        type: 'guess-letter',
        animal,
        targetChar,
        targetInputKey: normalizeAnimalKey(animal.key),
        options,
        prompt: isPhonic ? `Gdzie jest głoska ${targetChar}?` : `Gdzie jest literka ${targetChar}?`,
        speech: isPhonic
          ? `Gdzie jest głoska ${sound}? Wciśnij ${targetChar} na klawiaturze.`
          : `Gdzie jest literka ${sound}? Wciśnij ${targetChar} na klawiaturze.`,
      };
      return this.currentQuestion;
    }

    if (this.mode === 'first-letter') {
      const animal = this.allAnimals[Math.floor(Math.random() * this.allAnimals.length)];
      const targetChar = animal.key.toLocaleUpperCase('pl');
      const sound = getLetterPronunciation(targetChar, this.phonicsMode);
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
      this.spellingCount++;
      // Periodically spell child's name if set
      const isChildNameRound = this.childName.length >= 2 && (this.spellingCount % 4 === 0);

      if (isChildNameRound) {
        const word = this.childName.toLocaleUpperCase('pl');
        const letters = [...word];
        const initial = letters[0].toLowerCase();
        const matchingAnimal = this.allAnimals.find(a => normalizeAnimalKey(a.key) === normalizeAnimalKey(initial)) || this.allAnimals[0];

        this.currentQuestion = {
          type: 'spelling',
          isChildName: true,
          animal: matchingAnimal,
          word,
          letters,
          stepIndex: 0,
          typed: [],
          prompt: `Napisz swoje imię: ${word}`,
          speech: `Ułóżmy Twoje imię: ${word}! Wciśnij literkę ${letters[0]}.`,
        };
        return this.currentQuestion;
      }

      const animal = this.spellingPool[Math.floor(Math.random() * this.spellingPool.length)];
      const word = animal.name.toLocaleUpperCase('pl');
      const letters = [...word];
      this.currentQuestion = {
        type: 'spelling',
        isChildName: false,
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
    for (let i = distractors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
    }
    const choices = [targetLetter, distractors[0], distractors[1]];
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
      const sound = getLetterPronunciation(target, this.phonicsMode);
      return {
        correct: isCorrect,
        finished: isCorrect,
        animal,
        letter: target,
        prompt: isCorrect ? `Brawo! To literka ${target}!` : `Spróbuj jeszcze raz. Gdzie jest ${target}?`,
        speech: isCorrect
          ? `Brawo! Literka ${sound}! Jak ${animal.name}!`
          : `Spróbuj jeszcze raz. Wciśnij literkę ${sound}.`,
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
        const isChild = this.currentQuestion.isChildName;
        return {
          correct: true,
          finished: true,
          animal: this.currentQuestion.animal,
          word: this.currentQuestion.word,
          isChildName: isChild,
          prompt: isChild ? `Wspaniale, ${this.currentQuestion.word}!` : `Wspaniale! Słowo ${this.currentQuestion.word}!`,
          speech: isChild
            ? `Wspaniale! Pięknie napisałeś swoje imię, ${this.currentQuestion.word}!`
            : `Wspaniale! Ułożyłeś słowo ${this.currentQuestion.word}!`,
        };
      }

      const nextExpected = this.currentQuestion.letters[this.currentQuestion.stepIndex];
      return {
        correct: true,
        finished: false,
        animal: this.currentQuestion.animal,
        stepIndex: this.currentQuestion.stepIndex,
        prompt: `Napisz: ${this.currentQuestion.word}`,
        speech: `Świetnie! Teraz wciśnij ${nextExpected}.`,
      };
    }

    return null;
  }
}

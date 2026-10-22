// Educational Quiz Engine for Android TV with physical keyboard support
// Modes:
// 1. 'explore' - Free discovery (original mode)
// 2. 'guess-letter' - Audio/visual letter recognition ("Wciśnij literkę M" / "Wskaż głoskę M")
// 3. 'first-letter' - Initial sound & letter matching ("Na jaką literę zaczyna się Kot?")
// 4. 'spelling' - Word spelling letter-by-letter ("Napiszmy słowo KOT" lub imię dziecka)
// 5. 'memory' - Memory card matching mode
// 6. 'shadow' - Silhouette mystery ("Kto się schował?")
// 7. 'syllables' - Syllable-by-syllable word construction (Metoda sylabowa)
// 8. 'sound' - Audio riddle / Animal sound recognition ("Kto wydał ten dźwięk?")

import { normalizeAnimalKey } from './animals.js';
import { getLetterPronunciation } from './phonics.js';
import { getSyllablesForAnimal } from './syllables.js';
import { hasAnimalSound } from './animal-sounds.js';

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
    this.correctInRow = 0;
    this.wrongInRow = 0;
    this.wrongOnQuestion = 0;
    this.currentQuestion = null;
    this.spellingPool = allAnimals.filter(a => SHORT_ANIMAL_NAMES.has(a.name.toLocaleLowerCase('pl')));
    if (this.spellingPool.length === 0) this.spellingPool = allAnimals.filter(a => a.name.length <= 5);
    this.soundPool = allAnimals.filter(a => hasAnimalSound(a));
    this.syllablePool = allAnimals.filter(a => getSyllablesForAnimal(a).length >= 2);
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

    if (this.mode === 'shadow') {
      const animal = this.allAnimals[Math.floor(Math.random() * this.allAnimals.length)];
      const targetChar = animal.key.toLocaleUpperCase('pl');
      const sound = getLetterPronunciation(targetChar, this.phonicsMode);
      const options = this.generateOptions(targetChar);

      this.currentQuestion = {
        type: 'shadow',
        animal,
        targetChar,
        targetInputKey: normalizeAnimalKey(animal.key),
        options,
        prompt: `Kto się schował? Zgadnij po cieniu!`,
        speech: `Kto tam się schował? Rozpoznajesz cień? Zaczyna się na literkę ${sound}!`,
      };
      return this.currentQuestion;
    }

    if (this.mode === 'sound') {
      const pool = this.soundPool.length > 0 ? this.soundPool : this.allAnimals;
      const animal = pool[Math.floor(Math.random() * pool.length)];
      const targetChar = animal.key.toLocaleUpperCase('pl');
      const options = this.generateOptions(targetChar);

      this.currentQuestion = {
        type: 'sound',
        animal,
        targetChar,
        targetInputKey: normalizeAnimalKey(animal.key),
        options,
        prompt: `Kto wydał ten dźwięk? Posłuchaj!`,
        speech: `Posłuchaj dźwięku! Jakie to zwierzątko?`,
      };
      return this.currentQuestion;
    }

    if (this.mode === 'syllables') {
      const pool = this.syllablePool.length > 0 ? this.syllablePool : this.allAnimals;
      const animal = pool[Math.floor(Math.random() * pool.length)];
      const syllables = getSyllablesForAnimal(animal);
      const targetSyllable = syllables[0];
      const options = this.generateSyllableOptions(targetSyllable);

      this.currentQuestion = {
        type: 'syllables',
        animal,
        syllables,
        stepIndex: 0,
        targetSyllable,
        targetChar: targetSyllable[0],
        targetInputKey: normalizeAnimalKey(targetSyllable[0]),
        options,
        prompt: `Złóż słowo: ${animal.name.toLocaleUpperCase('pl')}`,
        speech: `Złóżmy słowo: ${animal.name}. Pierwsza sylaba: ${targetSyllable}.`,
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

  generateSyllableOptions(targetSyllable) {
    const commonSyllables = ['BA', 'KO', 'SO', 'MA', 'TA', 'PA', 'DA', 'LE', 'RA', 'ZA', 'NO', 'WO', 'GA', 'KA', 'KA'];
    const distractors = commonSyllables.filter(s => s !== targetSyllable);
    for (let i = distractors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
    }
    const choices = [targetSyllable, distractors[0] || 'KO', distractors[1] || 'BA'];
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return choices;
  }

  // Adaptive difficulty: 3 choices by default, 2 after repeated mistakes, 4 after a good run.
  optionCount() {
    if (this.wrongInRow >= 2) return 2;
    if (this.correctInRow >= 6) return 4;
    return 3;
  }

  generateOptions(targetLetter, count = this.optionCount()) {
    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'W', 'Z'];
    const distractors = alphabet.filter(l => l !== targetLetter);
    for (let i = distractors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
    }
    const choices = [targetLetter, ...distractors.slice(0, count - 1)];
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return choices;
  }

  checkInput(rawKey) {
    if (!this.currentQuestion) return null;
    const inputKey = normalizeAnimalKey(rawKey);

    if (this.mode === 'guess-letter' || this.mode === 'first-letter' || this.mode === 'shadow' || this.mode === 'sound') {
      const isCorrect = inputKey === this.currentQuestion.targetInputKey;
      const target = this.currentQuestion.targetChar;
      const animal = this.currentQuestion.animal;
      const sound = getLetterPronunciation(target, this.phonicsMode);
      if (isCorrect) {
        this.correctInRow++;
        this.wrongInRow = 0;
        this.wrongOnQuestion = 0;
      } else {
        this.wrongInRow++;
        this.wrongOnQuestion++;
        this.correctInRow = Math.max(0, this.correctInRow - 2);
      }

      let successSpeech = `Brawo! Literka ${sound}! Jak ${animal.name}!`;
      if (this.mode === 'shadow') {
        successSpeech = `Brawo! W cieniu schował się ${animal.name}!`;
      } else if (this.mode === 'sound') {
        successSpeech = `Brawo! Ten dźwięk wydaje ${animal.name}!`;
      }

      return {
        correct: isCorrect,
        finished: isCorrect,
        // After two mistakes on one question the app points at the right answer.
        hint: !isCorrect && this.wrongOnQuestion >= 2,
        animal,
        letter: target,
        prompt: isCorrect ? `Brawo! To ${animal.name}!` : `Spróbuj jeszcze raz. Gdzie jest ${target}?`,
        speech: isCorrect ? successSpeech : `Spróbuj jeszcze raz. Wciśnij literkę ${sound}.`,
      };
    }

    if (this.mode === 'syllables') {
      const targetSyllable = this.currentQuestion.syllables[this.currentQuestion.stepIndex];
      const targetInitial = normalizeAnimalKey(targetSyllable[0]);
      const isMatch = (typeof rawKey === 'string' && rawKey.toUpperCase() === targetSyllable) || inputKey === targetInitial;

      if (!isMatch) {
        return {
          correct: false,
          finished: false,
          animal: this.currentQuestion.animal,
          prompt: `Wybierz sylabę: ${targetSyllable}`,
          speech: `Spróbuj jeszcze raz. Szukamy sylaby ${targetSyllable}.`,
        };
      }

      this.currentQuestion.stepIndex++;
      const finished = this.currentQuestion.stepIndex >= this.currentQuestion.syllables.length;

      if (finished) {
        return {
          correct: true,
          finished: true,
          animal: this.currentQuestion.animal,
          prompt: `Wspaniale! ${this.currentQuestion.syllables.join(' - ')}!`,
          speech: `Wspaniale! ${this.currentQuestion.syllables.join('... ')}! To ${this.currentQuestion.animal.name}!`,
        };
      }

      const nextSyllable = this.currentQuestion.syllables[this.currentQuestion.stepIndex];
      this.currentQuestion.targetSyllable = nextSyllable;
      this.currentQuestion.targetChar = nextSyllable[0];
      this.currentQuestion.targetInputKey = normalizeAnimalKey(nextSyllable[0]);
      this.currentQuestion.options = this.generateSyllableOptions(nextSyllable);

      return {
        correct: true,
        finished: false,
        animal: this.currentQuestion.animal,
        stepIndex: this.currentQuestion.stepIndex,
        targetSyllable: nextSyllable,
        options: this.currentQuestion.options,
        prompt: `Druga sylaba: ${nextSyllable}`,
        speech: `Świetnie! Następna sylaba to: ${nextSyllable}.`,
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

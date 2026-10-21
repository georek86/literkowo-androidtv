// Progression, star rewards, collectible cards, and letter learning statistics
// Stored persistently in localStorage

const STORAGE_KEY = 'literkowo_progress_v1';
const STARS_PER_CARD = 2;
const INITIAL_CARDS = ['kot', 'pies', 'lis'];

export class CollectionManager {
  constructor(allAnimals = []) {
    this.allAnimals = allAnimals;
    this.data = this.load();
  }

  load() {
    const defaults = {
      stars: 0,
      unlockedCards: [...INITIAL_CARDS],
      letterStats: {},
    };
    if (typeof localStorage === 'undefined') return defaults;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      return {
        stars: Number(parsed.stars) || 0,
        unlockedCards: Array.isArray(parsed.unlockedCards) && parsed.unlockedCards.length > 0
          ? parsed.unlockedCards
          : [...INITIAL_CARDS],
        letterStats: typeof parsed.letterStats === 'object' && parsed.letterStats !== null
          ? parsed.letterStats
          : {},
      };
    } catch {
      return defaults;
    }
  }

  save() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Storage quota or private browsing; fail silently
    }
  }

  getStars() {
    return this.data.stars;
  }

  isCardUnlocked(animal) {
    if (!animal) return false;
    const name = (animal.name || animal).toLocaleLowerCase('pl');
    return this.data.unlockedCards.includes(name);
  }

  getUnlockedCount() {
    return this.data.unlockedCards.length;
  }

  getTotalCardsCount() {
    return this.allAnimals.length || 100;
  }

  // Adds a star and checks if a new card is unlocked
  addStar() {
    this.data.stars++;
    let unlockedAnimal = null;

    // Check if we should unlock a new card
    const shouldHaveCards = Math.min(
      this.allAnimals.length,
      INITIAL_CARDS.length + Math.floor(this.data.stars / STARS_PER_CARD)
    );

    if (this.data.unlockedCards.length < shouldHaveCards && this.allAnimals.length > 0) {
      const lockedPool = this.allAnimals.filter(
        a => !this.data.unlockedCards.includes(a.name.toLocaleLowerCase('pl'))
      );
      if (lockedPool.length > 0) {
        const choice = lockedPool[Math.floor(Math.random() * lockedPool.length)];
        this.data.unlockedCards.push(choice.name.toLocaleLowerCase('pl'));
        unlockedAnimal = choice;
      }
    }

    this.save();
    return {
      stars: this.data.stars,
      unlockedAnimal,
    };
  }

  recordAnswer(letter, isCorrect) {
    if (!letter) return;
    const key = letter.toLocaleLowerCase('pl');
    if (!this.data.letterStats[key]) {
      this.data.letterStats[key] = { correct: 0, total: 0 };
    }
    this.data.letterStats[key].total++;
    if (isCorrect) {
      this.data.letterStats[key].correct++;
    }
    this.save();
  }

  getStatsSummary() {
    const letters = [
      'a', 'ą', 'b', 'c', 'ć', 'd', 'e', 'ę', 'f', 'g', 'h',
      'i', 'j', 'k', 'l', 'ł', 'm', 'n', 'ń', 'o', 'ó', 'p',
      'r', 's', 'ś', 't', 'u', 'w', 'y', 'z', 'ź', 'ż'
    ];
    return letters.map(char => {
      const stat = this.data.letterStats[char];
      if (!stat || stat.total === 0) {
        return { letter: char, status: 'untested', rate: 0, total: 0, correct: 0 };
      }
      const rate = Math.round((stat.correct / stat.total) * 100);
      const status = stat.total >= 2 && rate >= 75 ? 'mastered' : 'learning';
      return { letter: char, status, rate, total: stat.total, correct: stat.correct };
    });
  }

  resetProgress() {
    this.data = {
      stars: 0,
      unlockedCards: [...INITIAL_CARDS],
      letterStats: {},
    };
    this.save();
  }
}

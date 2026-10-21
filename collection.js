// Progression, star rewards, collectible cards, and letter learning statistics
// Supports multiple player profiles (e.g. siblings) and personalized child name spelling

const STORAGE_KEY = 'literkowo_progress_v2';
const LEGACY_STORAGE_KEY = 'literkowo_progress_v1';
const STARS_PER_CARD = 2;
const INITIAL_CARDS = ['kot', 'pies', 'lis'];

function createDefaultProfile(name = 'Dziecko 1') {
  return {
    name,
    childName: '',
    stars: 0,
    unlockedCards: [...INITIAL_CARDS],
    letterStats: {},
  };
}

export class CollectionManager {
  constructor(allAnimals = []) {
    this.allAnimals = allAnimals;
    this.state = this.load();
  }

  load() {
    const defaults = {
      activeProfileId: 'profile_1',
      phonicsMode: 'alphabet', // 'alphabet' | 'phonics'
      nightMode: false,
      keyboardHint: true,
      profiles: {
        profile_1: createDefaultProfile('Gracz 1'),
        profile_2: createDefaultProfile('Gracz 2'),
      },
    };

    if (typeof localStorage === 'undefined') return defaults;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...defaults,
          ...parsed,
          profiles: {
            profile_1: { ...defaults.profiles.profile_1, ...(parsed.profiles?.profile_1 || {}) },
            profile_2: { ...defaults.profiles.profile_2, ...(parsed.profiles?.profile_2 || {}) },
          },
        };
      }

      // Check legacy v1 data
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        defaults.profiles.profile_1.stars = Number(legacy.stars) || 0;
        if (Array.isArray(legacy.unlockedCards)) {
          defaults.profiles.profile_1.unlockedCards = legacy.unlockedCards;
        }
        if (typeof legacy.letterStats === 'object' && legacy.letterStats !== null) {
          defaults.profiles.profile_1.letterStats = legacy.letterStats;
        }
      }
      return defaults;
    } catch {
      return defaults;
    }
  }

  save() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Storage quota or private browsing; fail silently
    }
  }

  getActiveProfile() {
    return this.state.profiles[this.state.activeProfileId] || this.state.profiles.profile_1;
  }

  getActiveProfileId() {
    return this.state.activeProfileId;
  }

  switchProfile(profileId) {
    if (this.state.profiles[profileId]) {
      this.state.activeProfileId = profileId;
      this.save();
    }
    return this.getActiveProfile();
  }

  setProfileName(profileId, name) {
    if (this.state.profiles[profileId] && name) {
      this.state.profiles[profileId].name = name.trim();
      this.save();
    }
  }

  setChildName(name) {
    const p = this.getActiveProfile();
    p.childName = (name || '').trim();
    this.save();
  }

  getChildName() {
    return this.getActiveProfile().childName || '';
  }

  setPhonicsMode(mode) {
    this.state.phonicsMode = mode === 'phonics' ? 'phonics' : 'alphabet';
    this.save();
  }

  getPhonicsMode() {
    return this.state.phonicsMode || 'alphabet';
  }

  setNightMode(enabled) {
    this.state.nightMode = Boolean(enabled);
    this.save();
  }

  isNightMode() {
    return Boolean(this.state.nightMode);
  }

  setKeyboardHint(enabled) {
    this.state.keyboardHint = Boolean(enabled);
    this.save();
  }

  isKeyboardHint() {
    return this.state.keyboardHint !== false;
  }

  getStars() {
    return this.getActiveProfile().stars;
  }

  isCardUnlocked(animal) {
    if (!animal) return false;
    const name = (animal.name || animal).toLocaleLowerCase('pl');
    return this.getActiveProfile().unlockedCards.includes(name);
  }

  getUnlockedCount() {
    return this.getActiveProfile().unlockedCards.length;
  }

  getTotalCardsCount() {
    return this.allAnimals.length || 100;
  }

  addStar() {
    const profile = this.getActiveProfile();
    profile.stars++;
    let unlockedAnimal = null;

    const shouldHaveCards = Math.min(
      this.allAnimals.length,
      INITIAL_CARDS.length + Math.floor(profile.stars / STARS_PER_CARD)
    );

    if (profile.unlockedCards.length < shouldHaveCards && this.allAnimals.length > 0) {
      const lockedPool = this.allAnimals.filter(
        a => !profile.unlockedCards.includes(a.name.toLocaleLowerCase('pl'))
      );
      if (lockedPool.length > 0) {
        const choice = lockedPool[Math.floor(Math.random() * lockedPool.length)];
        profile.unlockedCards.push(choice.name.toLocaleLowerCase('pl'));
        unlockedAnimal = choice;
      }
    }

    this.save();
    return {
      stars: profile.stars,
      unlockedAnimal,
    };
  }

  recordAnswer(letter, isCorrect) {
    if (!letter) return;
    const key = letter.toLocaleLowerCase('pl');
    const profile = this.getActiveProfile();
    if (!profile.letterStats[key]) {
      profile.letterStats[key] = { correct: 0, total: 0 };
    }
    profile.letterStats[key].total++;
    if (isCorrect) {
      profile.letterStats[key].correct++;
    }
    this.save();
  }

  getStatsSummary() {
    const letters = [
      'a', 'ą', 'b', 'c', 'ć', 'd', 'e', 'ę', 'f', 'g', 'h',
      'i', 'j', 'k', 'l', 'ł', 'm', 'n', 'ń', 'o', 'ó', 'p',
      'r', 's', 'ś', 't', 'u', 'w', 'y', 'z', 'ź', 'ż'
    ];
    const profile = this.getActiveProfile();
    return letters.map(char => {
      const stat = profile.letterStats[char];
      if (!stat || stat.total === 0) {
        return { letter: char, status: 'untested', rate: 0, total: 0, correct: 0 };
      }
      const rate = Math.round((stat.correct / stat.total) * 100);
      const status = stat.total >= 2 && rate >= 75 ? 'mastered' : 'learning';
      return { letter: char, status, rate, total: stat.total, correct: stat.correct };
    });
  }

  resetProgress() {
    const profile = this.getActiveProfile();
    profile.stars = 0;
    profile.unlockedCards = [...INITIAL_CARDS];
    profile.letterStats = {};
    this.save();
  }
}

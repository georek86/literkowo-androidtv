// Educational Memory Card Game Mode
// Match Letter to Animal or Uppercase to Lowercase

export class MemoryGame {
  constructor() {
    this.cards = [];
    this.flippedIndices = [];
    this.matchedPairsCount = 0;
    this.totalPairs = 0;
    this.isLocked = false;
  }

  start(allAnimals, pairCount = 3) {
    this.flippedIndices = [];
    this.matchedPairsCount = 0;
    this.totalPairs = pairCount;
    this.isLocked = false;

    // Pick random animals for pairs
    const pool = [...allAnimals];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const selected = pool.slice(0, pairCount);

    const cards = [];
    let idCounter = 0;
    selected.forEach((animal, pairIdx) => {
      // Card 1: Letter
      cards.push({
        id: idCounter++,
        pairId: pairIdx,
        kind: 'letter',
        label: animal.key.toUpperCase(),
        animal,
        flipped: false,
        matched: false,
      });
      // Card 2: Animal Illustration & Name
      cards.push({
        id: idCounter++,
        pairId: pairIdx,
        kind: 'animal',
        label: animal.name,
        animal,
        flipped: false,
        matched: false,
      });
    });

    // Shuffle cards
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    this.cards = cards;
    return this.cards;
  }

  flip(cardIndex) {
    if (this.isLocked) return null;
    const card = this.cards[cardIndex];
    if (!card || card.flipped || card.matched) return null;

    card.flipped = true;
    this.flippedIndices.push(cardIndex);

    if (this.flippedIndices.length === 1) {
      return { status: 'one-flipped', cardIndex, card };
    }

    if (this.flippedIndices.length === 2) {
      const idx1 = this.flippedIndices[0];
      const idx2 = this.flippedIndices[1];
      const c1 = this.cards[idx1];
      const c2 = this.cards[idx2];
      const isMatch = c1.pairId === c2.pairId;

      if (isMatch) {
        c1.matched = true;
        c2.matched = true;
        this.matchedPairsCount++;
        this.flippedIndices = [];
        const isComplete = this.matchedPairsCount === this.totalPairs;
        return {
          status: 'match',
          complete: isComplete,
          card1: c1,
          card2: c2,
          animal: c1.animal,
        };
      } else {
        this.isLocked = true;
        return {
          status: 'mismatch',
          complete: false,
          card1: c1,
          card2: c2,
        };
      }
    }

    return null;
  }

  resolveMismatch() {
    for (const idx of this.flippedIndices) {
      if (this.cards[idx]) {
        this.cards[idx].flipped = false;
      }
    }
    this.flippedIndices = [];
    this.isLocked = false;
  }
}

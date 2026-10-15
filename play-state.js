// Ignore input during a presentation; never queue a child's rapid key presses.
export class PlayState {
  constructor({ now = () => performance.now(), minimumInterval = 2200 } = {}) {
    this.now = now;
    this.minimumInterval = minimumInterval;
    this.active = false;
    this.nextAt = 0;
    this.waitStartedAt = 0;
    this.speaking = false;
  }
  start() { this.active = true; this.nextAt = 0; this.speaking = false; }
  stop() { this.active = false; this.speaking = false; }
  accept({ repeat = false } = {}) {
    if (repeat || this.readiness().phase !== 'ready') return false;
    this.waitStartedAt = this.now();
    this.nextAt = this.waitStartedAt + this.minimumInterval;
    return true;
  }
  speechEnded() {
    this.speaking = false;
    this.waitStartedAt = this.now();
    this.nextAt = Math.max(this.nextAt, this.waitStartedAt + 500);
  }
  readiness() {
    if (!this.active) return { phase: 'inactive', progress: 0 };
    if (this.speaking) return { phase: 'speaking', progress: 0 };
    const now = this.now();
    if (now >= this.nextAt) return { phase: 'ready', progress: 1 };
    const progress = Math.max(0, (now - this.waitStartedAt) / (this.nextAt - this.waitStartedAt));
    return { phase: 'waiting', progress };
  }
}

export function isAnimalInput(event) {
  if (['Escape','Shift','Control','Alt','AltGraph','Meta','Fn','FnLock','Dead','Unidentified','Process','Compose'].includes(event.key)) return false;
  const altGraph = event.getModifierState?.('AltGraph');
  // Also accept Polish letters produced with Option on a Mac.
  const polishOption = event.altKey && !event.ctrlKey && !event.metaKey && /^[ąćęłńóśźż]$/i.test(event.key);
  return !(event.ctrlKey || event.metaKey || event.altKey) || Boolean(altGraph || polishOption);
}

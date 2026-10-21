// Web Audio API procedural sound synthesizer
// Zero external assets, 0 KB network, 100% offline and low-latency

let audioCtx = null;
let soundEnabled = true;

export function setSoundEnabled(enabled) {
  soundEnabled = Boolean(enabled);
}

export function isSoundEnabled() {
  return soundEnabled;
}

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContextClass();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq, type = 'sine', startTime = 0, duration = 0.2, gainVal = 0.2) {
  const ctx = getAudioContext();
  if (!ctx || !soundEnabled) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

    gain.gain.setValueAtTime(0.001, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(gainVal, ctx.currentTime + startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration + 0.05);
  } catch {
    // Ignore audio playback issues
  }
}

// Cheerful major arpeggio for correct answer
export function playCorrect() {
  const ctx = getAudioContext();
  if (!ctx || !soundEnabled) return;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    playTone(freq, 'triangle', idx * 0.08, 0.25, 0.18);
  });
}

// High sparkling chime for earning a star
export function playStar() {
  const ctx = getAudioContext();
  if (!ctx || !soundEnabled) return;
  const notes = [1318.51, 1567.98, 1975.53, 2637.02]; // E6, G6, B6, E7
  notes.forEach((freq, idx) => {
    playTone(freq, 'sine', idx * 0.06, 0.35, 0.14);
  });
}

// Triumphant fanfare for completing a word or unlocking a card
export function playFanfare() {
  const ctx = getAudioContext();
  if (!ctx || !soundEnabled) return;
  const seq = [
    { freq: 523.25, start: 0, dur: 0.12 },     // C5
    { freq: 523.25, start: 0.12, dur: 0.12 },  // C5
    { freq: 523.25, start: 0.24, dur: 0.12 },  // C5
    { freq: 659.25, start: 0.36, dur: 0.24 },  // E5
    { freq: 783.99, start: 0.60, dur: 0.16 },  // G5
    { freq: 1046.5, start: 0.78, dur: 0.55 },  // C6
  ];
  seq.forEach(({ freq, start, dur }) => {
    playTone(freq, 'triangle', start, dur, 0.22);
  });
}

// Gentle, encouraging low tone for try again (never harsh or punishing)
export function playTryAgain() {
  const ctx = getAudioContext();
  if (!ctx || !soundEnabled) return;
  playTone(329.63, 'sine', 0, 0.18, 0.12);     // E4
  playTone(261.63, 'sine', 0.14, 0.25, 0.10);  // C4
}

// Subtle woody tap for TV menu navigation
export function playClick() {
  const ctx = getAudioContext();
  if (!ctx || !soundEnabled) return;
  playTone(440, 'triangle', 0, 0.04, 0.06);
}

// Magical sparkling sweep for unlocking a collectible card
export function playCardUnlock() {
  const ctx = getAudioContext();
  if (!ctx || !soundEnabled) return;
  const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
  notes.forEach((freq, idx) => {
    playTone(freq, 'sine', idx * 0.05, 0.4, 0.12);
  });
}

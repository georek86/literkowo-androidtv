// Procedural Web Audio Animal Sound Synthesis
// 100% Offline, CC0 / Public Domain compliant, zero proprietary samples
// Generates recognizable, charming animal vocalizations

function getAudioContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!getAudioContext.ctx || getAudioContext.ctx.state === 'closed') {
    getAudioContext.ctx = new AudioCtx();
  }
  if (getAudioContext.ctx.state === 'suspended') {
    getAudioContext.ctx.resume().catch(() => {});
  }
  return getAudioContext.ctx;
}

// 1. Kot (Cat meow: "mrr-miau")
function synthesizeMeow(ctx, now) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1600, now);

  // Pitch sweep: 520Hz -> 820Hz -> 420Hz
  osc.frequency.setValueAtTime(500, now);
  osc.frequency.exponentialRampToValueAtTime(840, now + 0.25);
  osc.frequency.exponentialRampToValueAtTime(420, now + 0.65);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.28, now + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.72);
}

// 2. Pies (Dog bark: "hau! hau!")
function synthesizeBark(ctx, now) {
  for (let i = 0; i < 2; i++) {
    const t = now + i * 0.22;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(420, t);
    filter.Q.setValueAtTime(2.5, t);

    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }
}

// 3. Krowa (Cow moo: "muuu")
function synthesizeMoo(ctx, now) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(450, now);

  osc.frequency.setValueAtTime(145, now);
  osc.frequency.linearRampToValueAtTime(165, now + 0.3);
  osc.frequency.linearRampToValueAtTime(130, now + 0.9);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.28, now + 0.15);
  gain.gain.setValueAtTime(0.24, now + 0.6);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 1.0);
}

// 4. Żaba (Frog croak: "kum-kum")
function synthesizeCroak(ctx, now) {
  for (let i = 0; i < 2; i++) {
    const t = now + i * 0.28;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'square';
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(240, t);
    filter.Q.setValueAtTime(4, t);

    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(95, t + 0.14);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.32, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);
  }
}

// 5. Ptak / Wróbel (Bird chirp: "ćwir-ćwir")
function synthesizeChirp(ctx, now) {
  for (let i = 0; i < 3; i++) {
    const t = now + i * 0.14;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.exponentialRampToValueAtTime(3600, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(2200, t + 0.09);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.11);
  }
}

// 6. Pszczoła / Osa (Bee buzz: "bzzzz")
function synthesizeBuzz(ctx, now) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(210, now);

  // Vibrato modulation
  lfo.frequency.setValueAtTime(35, now);
  lfoGain.gain.setValueAtTime(25, now);
  lfo.connect(osc.frequency);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
  gain.gain.setValueAtTime(0.18, now + 0.45);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  osc.connect(gain);
  gain.connect(ctx.destination);

  lfo.start(now);
  osc.start(now);
  lfo.stop(now + 0.65);
  osc.stop(now + 0.65);
}

// 7. Wilk (Wolf howl: "auuuuu")
function synthesizeHowl(ctx, now) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(900, now);

  osc.frequency.setValueAtTime(240, now);
  osc.frequency.exponentialRampToValueAtTime(520, now + 0.4);
  osc.frequency.linearRampToValueAtTime(460, now + 0.8);
  osc.frequency.exponentialRampToValueAtTime(280, now + 1.25);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.24, now + 0.25);
  gain.gain.setValueAtTime(0.22, now + 0.7);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 1.35);
}

// 8. Owca / Koza (Sheep bleat: "bee-ee")
function synthesizeBleat(ctx, now) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(280, now);

  lfo.frequency.setValueAtTime(14, now);
  lfoGain.gain.setValueAtTime(35, now);
  lfo.connect(osc.frequency);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.08);
  gain.gain.setValueAtTime(0.2, now + 0.5);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

  osc.connect(gain);
  gain.connect(ctx.destination);

  lfo.start(now);
  osc.start(now);
  lfo.stop(now + 0.8);
  osc.stop(now + 0.8);
}

// 9. Lew (Lion roar: low rumble)
function synthesizeRoar(ctx, now) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(320, now);

  osc.frequency.setValueAtTime(110, now);
  osc.frequency.linearRampToValueAtTime(140, now + 0.2);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.8);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.32, now + 0.1);
  gain.gain.setValueAtTime(0.28, now + 0.5);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.9);
}

// 10. Kaczka (Duck quack: "kwa-kwa")
function synthesizeQuack(ctx, now) {
  for (let i = 0; i < 2; i++) {
    const t = now + i * 0.24;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, t);
    filter.frequency.exponentialRampToValueAtTime(400, t + 0.14);
    filter.Q.setValueAtTime(3.5, t);

    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.14);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);
  }
}

// 11. Mysz (Mouse squeak: "pi-pi")
function synthesizeSqueak(ctx, now) {
  for (let i = 0; i < 2; i++) {
    const t = now + i * 0.12;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(3400, t);
    osc.frequency.exponentialRampToValueAtTime(4200, t + 0.03);
    osc.frequency.exponentialRampToValueAtTime(3000, t + 0.08);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
  }
}

// Map animal names to synthesizers
const SOUND_SYNTHESIZERS = {
  'kot': synthesizeMeow,
  'pies': synthesizeBark,
  'krowa': synthesizeMoo,
  'żaba': synthesizeCroak,
  'ptak': synthesizeChirp,
  'wróbel': synthesizeChirp,
  'jaskółka': synthesizeChirp,
  'pszczoła': synthesizeBuzz,
  'osa': synthesizeBuzz,
  'bąk': synthesizeBuzz,
  'wilk': synthesizeHowl,
  'owca': synthesizeBleat,
  'koza': synthesizeBleat,
  'bartek': synthesizeBleat,
  'lew': synthesizeRoar,
  'tygrys': synthesizeRoar,
  'kaczka': synthesizeQuack,
  'gęś': synthesizeQuack,
  'mysz': synthesizeSqueak,
  'szczur': synthesizeSqueak,
  'chomik': synthesizeSqueak
};

export const ANIMALS_WITH_SOUNDS = Object.keys(SOUND_SYNTHESIZERS);

export function hasAnimalSound(animal) {
  if (!animal) return false;
  const name = (animal.name || animal.key || animal).toLocaleLowerCase('pl');
  return Boolean(SOUND_SYNTHESIZERS[name]);
}

export function playAnimalSound(animal) {
  if (!animal) return false;
  const name = (animal.name || animal.key || animal).toLocaleLowerCase('pl');
  const synthFn = SOUND_SYNTHESIZERS[name];
  if (!synthFn) return false;

  try {
    const ctx = getAudioContext();
    if (!ctx) return false;
    synthFn(ctx, ctx.currentTime);
    return true;
  } catch {
    return false;
  }
}

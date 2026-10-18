import { AnimalAlbum, illustration } from './animals.js';
import { updateGaze, resetGaze } from './gaze.js';
import { habitatFor } from './habitats.js';
import { isAnimalInput, PlayState } from './play-state.js';
import { acquireKeyboardProtection } from './keyboard-protection.js';

const $ = id => document.getElementById(id);
const state = new PlayState();
const synth = window.speechSynthesis;
let phase = 'welcome';
const album = new AnimalAlbum();
let currentAnimal = album.current;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
// Touch-first devices start in a window without requiring keyboard protection.
if (window.matchMedia('(pointer: coarse)').matches) {
  $('fullscreen').checked = false;
  $('touch-note').hidden = false;
}
let readinessFrame;
let polishVoice = null;
let speechVersion = 0;
let speechTimeout;
let activeUtterance;
let locked = false;
let wantsFullscreen = false;
let endAt = 0;
let remaining = 0;
let sessionTimer;
let clockTimer;
let holdTimer;
const parentHoldDuration = 2000;
let holdPointerId = null;
let holdBorder;
let noticeTimer;
let greetingTimer;
let debugPanel;

function updateReadiness() {
  cancelAnimationFrame(readinessFrame);
  const indicator = $('readiness');
  indicator.hidden = phase !== 'playing';
  if (indicator.hidden) return;
  const status = state.readiness();
  const labels = { ready: 'Można dalej', waiting: 'Chwila przerwy', speaking: 'Słuchamy', inactive: 'Przerwa' };
  const label = labels[status.phase];
  indicator.dataset.state = status.phase;
  indicator.setAttribute('aria-valuetext', label);
  if (status.phase === 'speaking') indicator.removeAttribute('aria-valuenow');
  else indicator.setAttribute('aria-valuenow', Math.round(status.progress * 100));
  if ($('readiness-label').textContent !== label) $('readiness-label').textContent = label;
  const progress = reducedMotion.matches && status.phase !== 'ready' ? 0 : status.progress;
  $('readiness-fill').setAttribute('stroke-dashoffset', 100 * (1 - progress));
  // No animation loop while the narrator speaks or after the circle is full.
  if (status.phase === 'waiting') readinessFrame = requestAnimationFrame(updateReadiness);
}
reducedMotion.addEventListener('change', updateReadiness);

function updateVoices() {
  const voices = synth?.getVoices() || [];
  const polish = voices.filter(voice => /^pl(?:[-_]|$)/i.test(voice.lang));
  polishVoice = polish.find(voice => voice.localService) || polish[0] || null;
  $('voice-note').textContent = polishVoice
    ? (polishVoice.localService ? 'Polski głos jest dostępny na tym urządzeniu.' : 'Polski głos może wymagać połączenia z internetem.')
    : 'Brak polskiego głosu na tym urządzeniu. Możecie sami nazywać zwierzątka lub doinstalować polski głos w systemie.';
}
synth?.addEventListener('voiceschanged', updateVoices);
updateVoices();

function notice(message) {
  clearTimeout(noticeTimer);
  $('notice').textContent = message;
  $('notice').hidden = false;
  noticeTimer = setTimeout(() => { $('notice').hidden = true; }, 6500);
}

function cancelSpeech() {
  speechVersion++;
  clearTimeout(speechTimeout);
  if (activeUtterance) synth?.cancel();
  activeUtterance = null;
  state.speaking = false;
}

function speak(animal) {
  if (!$('sound').checked || !polishVoice || !synth) return;
  // Keep a reference and wait for end/error. Never accumulate utterances.
  const version = ++speechVersion;
  state.speaking = true;
  updateReadiness();
  const utterance = new SpeechSynthesisUtterance(animal.name);
  activeUtterance = utterance;
  utterance.voice = polishVoice;
  utterance.lang = 'pl-PL';
  utterance.rate = .82;
  utterance.pitch = 1;
  utterance.volume = .55;
  const complete = () => {
    if (version !== speechVersion) return;
    clearTimeout(speechTimeout);
    activeUtterance = null;
    state.speechEnded();
    updateReadiness();
  };
  utterance.onend = complete;
  utterance.onerror = () => {
    complete();
    if (version === speechVersion) notice('Lektor jest niedostępny. Możecie nadal bawić się bez dźwięku.');
  };
  speechTimeout = setTimeout(() => {
    if (version !== speechVersion) return;
    cancelSpeech();
    state.speechEnded();
    updateReadiness();
    notice('Lektor nie odpowiada. Zabawa działa dalej bez oczekiwania na głos.');
  }, 7000);
  try { synth.speak(utterance); } catch { utterance.onerror(); }
}

function renderAppearance() {
  const scenery = $('scenery').checked;
  const habitat = habitatFor(currentAnimal);
  $('illustration').innerHTML = illustration(currentAnimal, { scenery });
  $('illustration').setAttribute('aria-label', `Ilustracja: ${currentAnimal.name}${scenery ? ` — ${habitat.label.toLocaleLowerCase('pl')}` : ''}`);
  $('stage-caption').textContent = scenery ? habitat.label.toLocaleUpperCase('pl') : (phase === 'welcome' ? 'POZNAJMY SIĘ' : 'MAŁE SPOTKANIA');
  $('stage').classList.toggle('with-scenery', scenery);
}
for (const id of ['scenery', 'setting-scenery']) $(id).addEventListener('change', () => {
  const enabled = $(id).checked;
  $('scenery').checked = enabled;
  $('setting-scenery').checked = enabled;
  renderAppearance();
});

function showAnimal(animal, animate = true) {
  currentAnimal = animal;
  $('letter').replaceChildren(document.createTextNode(animal.key.toLocaleUpperCase('pl')));
  const lowercase = document.createElement('span');
  lowercase.textContent = animal.key;
  $('letter').append(lowercase);
  $('animal-name').textContent = animal.name;
  renderAppearance();
  $('stage-hint').querySelector('kbd').textContent = animal.inputKey.toUpperCase();
  $('stage-hint').querySelector('span').textContent = `${animal.name} — spróbuj innego klawisza.`;
  $('animal-content').classList.remove('appearing', 'greeting');
  if (animate) {
    // Restart only on accepted input, never on every raw keydown.
    void $('animal-content').offsetWidth;
    $('animal-content').classList.add('appearing');
  }
}

function greet() {
  clearTimeout(greetingTimer);
  $('animal-content').classList.remove('greeting', 'appearing');
  void $('animal-content').offsetWidth;
  $('animal-content').classList.add('greeting');
  greetingTimer = setTimeout(() => $('animal-content').classList.remove('greeting'), 1400);
}

function discoverAnimal(key, event = {}) {
  if (phase !== 'playing') return;
  if (performance.now() >= endAt) { finish(); return; }
  if (!state.accept(event)) return;
  const animal = album.next(key);
  if (animal !== currentAnimal) showAnimal(animal);
  else greet();
  speak(animal);
  updateReadiness();
}

function cancelParentHold() {
  clearTimeout(holdTimer);
  holdPointerId = null;
  holdBorder?.remove();
  holdBorder = null;
  $('parent-button').classList.remove('holding');
}

function startParentHold(event) {
  if (!['playing', 'finished'].includes(phase) || event.button !== 0 || !event.isPrimary) return;
  event.preventDefault();
  cancelParentHold();
  holdPointerId = event.pointerId;
  const button = $('parent-button');
  const { width: w, height: h } = button.getBoundingClientRect();
  const r = h / 2 - 1;
  // Trace the actual pill outline clockwise, starting at its top centre.
  const ns = 'http://www.w3.org/2000/svg';
  holdBorder = document.createElementNS(ns, 'svg');
  holdBorder.setAttribute('class', 'parent-hold-border');
  holdBorder.setAttribute('viewBox', `0 0 ${w} ${h}`);
  holdBorder.setAttribute('aria-hidden', 'true');
  holdBorder.setAttribute('focusable', 'false');
  holdBorder.style.setProperty('--hold-duration', `${parentHoldDuration}ms`);
  const trace = document.createElementNS(ns, 'path');
  trace.setAttribute('d', `M${w / 2} 1 H${w - h / 2} A${r} ${r} 0 0 1 ${w - 1} ${h / 2} A${r} ${r} 0 0 1 ${w - h / 2} ${h - 1} H${h / 2} A${r} ${r} 0 0 1 1 ${h / 2} A${r} ${r} 0 0 1 ${h / 2} 1 Z`);
  trace.setAttribute('pathLength', '100');
  holdBorder.append(trace);
  button.append(holdBorder);
  button.classList.add('holding');
  holdTimer = setTimeout(() => phase === 'finished' ? returnToWelcome() : pause(), parentHoldDuration);
}

function releaseParentHold(event) {
  if (event.pointerId === holdPointerId) cancelParentHold();
}

function releaseKeyboard() {
  try { navigator.keyboard?.unlock(); } catch { /* Browser has already released it. */ }
  locked = false;
}

async function protectKeyboard() {
  if (!wantsFullscreen) {
    const message = 'Zabawa w oknie. Skróty przeglądarki i systemu mogą być aktywne.';
    $('lock-status').textContent = message;
    notice(message);
    return { locked: false, allowed: true };
  }
  const result = await acquireKeyboardProtection({ document, keyboard: navigator.keyboard, secureContext: window.isSecureContext });
  locked = result.locked;
  $('lock-status').textContent = locked
    ? 'Przeglądarka włączyła przechwytywanie wszystkich dostępnych jej klawiszy. Klawisz Windows/Super i część skrótów nadal mogą być zarezerwowane przez system.'
    : result.reason;
  return { ...result, allowed: locked };
}

function startClock() {
  clearTimeout(sessionTimer);
  clearInterval(clockTimer);
  endAt = performance.now() + remaining;
  sessionTimer = setTimeout(finish, remaining);
  updateClock();
  clockTimer = setInterval(updateClock, 250);
}

function updateClock() {
  const seconds = Math.max(0, Math.ceil((endAt - performance.now()) / 1000));
  const label = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  if ($('session-clock').textContent !== label) $('session-clock').textContent = label;
}

async function begin(resuming = false) {
  if (!['welcome','paused'].includes(phase)) return;
  phase = 'starting';
  cancelSpeech();
  $('start').disabled = true;
  $('resume').disabled = true;
  $('paused').close();
  $('protection-error').hidden = true;
  if (!resuming) {
    remaining = Number($('duration').value) * 60_000;
    wantsFullscreen = $('fullscreen').checked;
  }
  // Fullscreen needs to be requested directly from the parent's activation.
  const protection = await protectKeyboard();
  if (phase !== 'starting') return;
  if (!protection.allowed) {
    releaseKeyboard();
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    $('start').disabled = false;
    $('resume').disabled = false;
    const explanation = `${protection.reason} Zabawa nie została uruchomiona bez wybranej blokady.`;
    if (resuming) {
      phase = 'paused';
      $('pause-detail').textContent = `${explanation} Spróbuj ponownie lub zakończ zabawę, aby zmienić ustawienia.`;
      $('paused').showModal();
    } else {
      phase = 'welcome';
      $('protection-error').textContent = `${explanation} Spróbuj ponownie. Jeśli chcesz bawić się bez blokady, wyłącz opcję „Pełny ekran i blokada”.`;
      $('protection-error').hidden = false;
    }
    return;
  }
  if (!resuming) showAnimal(album.reset(), false);
  $('welcome').hidden = true;
  $('finish').hidden = true;
  $('play-instructions').hidden = false;
  renderAppearance();
  $('parent-button').textContent = 'Dla rodzica · przytrzymaj';
  $('parent-button').setAttribute('aria-label', 'Przytrzymaj przez 2 sekundy, aby wstrzymać zabawę');
  document.body.classList.add('playing');
  phase = 'playing';
  state.start();
  startClock();
  $('start').disabled = false;
  $('resume').disabled = false;
  if (document.hidden || !document.hasFocus()) { pause(); return; }
  if (!resuming && $('sound').checked && polishVoice && state.accept()) speak(currentAnimal);
  updateReadiness();
}

function pause() {
  if (phase !== 'playing') return;
  remaining = Math.max(0, endAt - performance.now());
  if (remaining === 0) { finish(); return; }
  phase = 'paused';
  clearTimeout(sessionTimer);
  clearInterval(clockTimer);
  cancelParentHold();
  state.stop();
  cancelSpeech();
  releaseKeyboard();
  updateReadiness();
  $('pause-detail').textContent = 'Na czas przerwy blokada klawiatury jest zwolniona. Przy wznowieniu spróbujemy włączyć ją ponownie, jeśli wybrano pełny ekran.';
  $('lock-status').textContent = 'Zabawa jest wstrzymana. Blokada klawiatury jest zwolniona.';
  $('paused').showModal();
}

function finish() {
  if (!['playing', 'paused'].includes(phase)) return;
  phase = 'finished';
  state.stop();
  clearTimeout(sessionTimer);
  clearInterval(clockTimer);
  cancelParentHold();
  cancelSpeech();
  updateReadiness();
  $('paused').close();
  $('welcome').hidden = true;
  $('finish').hidden = false;
  $('play-instructions').hidden = true;
  $('stage-caption').textContent = 'DO ZOBACZENIA';
  $('stage-hint').hidden = true;
  $('notice').hidden = true;
  $('animal-content').classList.remove('greeting', 'appearing');
  resetGaze($('stage'));
  document.body.classList.remove('playing');
  document.body.classList.add('sleeping');
  $('stage').hidden = true;
  $('parent-button').textContent = 'Dla rodzica · przytrzymaj';
  $('parent-button').setAttribute('aria-label', 'Przytrzymaj przez 2 sekundy, aby wrócić do początku');
  $('sleep-title').focus({ preventScroll: true });
}

$('start').addEventListener('click', () => begin());
$('resume').addEventListener('click', () => begin(true));
$('stop').addEventListener('click', returnToWelcome);
function returnToWelcome() {
  phase = 'welcome';
  state.stop();
  clearTimeout(sessionTimer);
  clearInterval(clockTimer);
  clearTimeout(greetingTimer);
  clearTimeout(noticeTimer);
  cancelParentHold();
  cancelSpeech();
  resetGaze($('stage'));
  releaseKeyboard();
  remaining = 0;
  endAt = 0;
  updateReadiness();
  $('paused').close();
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  document.body.classList.remove('playing', 'sleeping');
  $('finish').hidden = true;
  $('welcome').hidden = false;
  $('play-instructions').hidden = true;
  $('notice').hidden = true;
  $('protection-error').hidden = true;
  $('start').disabled = false;
  $('resume').disabled = false;
  $('stage').hidden = false;
  $('stage-hint').hidden = false;
  $('stage-caption').textContent = 'POZNAJMY SIĘ';
  $('parent-button').textContent = 'Dla rodzica';
  $('parent-button').setAttribute('aria-label', 'Dla rodzica');
  $('lock-status').textContent = 'Zabawa jest zakończona. Blokada klawiatury jest zwolniona.';
  showAnimal(album.reset(), false);
  $('start').focus();
}
$('settings-done').addEventListener('click', () => $('settings').close());
$('parent-button').addEventListener('click', () => {
  if (phase === 'welcome') $('settings').showModal();
});
$('parent-button').addEventListener('pointerdown', startParentHold);
$('parent-button').addEventListener('pointerleave', releaseParentHold);
for (const name of ['pointerup','pointercancel']) window.addEventListener(name, releaseParentHold);
// Touch pointers may retain implicit capture after moving outside the button.
$('parent-button').addEventListener('pointermove', event => {
  if (event.pointerId !== holdPointerId) return;
  const rect = $('parent-button').getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) cancelParentHold();
});
window.addEventListener('resize', cancelParentHold);
$('paused').addEventListener('cancel', event => event.preventDefault());
$('sound').addEventListener('change', () => {
  cancelSpeech();
  updateVoices();
  if ($('sound').checked && polishVoice) speak(currentAnimal);
});

window.addEventListener('keydown', event => {
  debugPanel?.recordKey(event);
  // A child pressing Enter must not activate the focused resume button.
  if (['paused', 'starting', 'finished'].includes(phase)) { event.preventDefault(); event.stopImmediatePropagation(); return; }
  if (phase !== 'playing') return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (performance.now() >= endAt) { finish(); return; }
  if (event.key === 'Escape') {
    if (!locked) pause();
    return;
  }
  if (!isAnimalInput(event)) return;
  discoverAnimal(event.key, event);
}, { capture: true });

for (const type of ['keyup','keypress']) window.addEventListener(type, event => {
  if (['playing','paused','starting','finished'].includes(phase)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, { capture: true });

for (const type of ['contextmenu','wheel','dragstart']) window.addEventListener(type, event => {
  if (phase === 'playing' || phase === 'finished') event.preventDefault();
}, { capture: true, passive: false });

// Capture movement across the whole viewport, including the header and notices.
// Leaving the picture must not cancel a fast mouse move or centre the pupils.
function followPointer(event) {
  if (phase === 'playing' && (event.pointerType === 'mouse' || event.isPrimary)) updateGaze($('stage'), event);
}
for (const type of ['pointermove', 'pointerover']) window.addEventListener(type, followPointer, { capture: true, passive: true });
for (const type of ['pointerup', 'pointercancel']) window.addEventListener(type, event => {
  if (event.isPrimary && event.pointerType !== 'mouse') resetGaze($('stage'));
}, { capture: true, passive: true });
document.querySelector('main').addEventListener('pointerdown', event => {
  if (phase === 'playing') {
    event.preventDefault();
    // One contact starts one discovery; holding or adding fingers cannot repeat it.
    if (event.isPrimary && event.button === 0) discoverAnimal(' ');
  }
});
document.addEventListener('fullscreenchange', () => {
  if (phase === 'playing' && !document.fullscreenElement) pause();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pause();
});
window.addEventListener('blur', () => { resetGaze($('stage')); cancelParentHold(); pause(); });
window.addEventListener('pagehide', () => { clearTimeout(sessionTimer); clearInterval(clockTimer); cancelAnimationFrame(readinessFrame); cancelParentHold(); cancelSpeech(); releaseKeyboard(); state.stop(); });
window.addEventListener('pageshow', event => {
  // A page restored from the back/forward cache must not look active while inert.
  if (event.persisted && phase === 'playing') pause();
});
showAnimal(currentAnimal, false);

if (new URLSearchParams(location.search).get('debug') === '1') {
  const { mountDebugPanel } = await import('./debug-mode.js');
  debugPanel = mountDebugPanel({
    pause,
    finish,
    snapshot: () => ({
      phase,
      remaining: phase === 'playing' ? Math.max(0, endAt - performance.now()) : phase === 'paused' ? remaining : 0,
      animal: currentAnimal.name,
      readiness: state.readiness().phase,
      fullscreen: Boolean(document.fullscreenElement),
      locked: locked && Boolean(document.fullscreenElement) && document.hasFocus() && !document.hidden,
      voice: polishVoice?.name,
    }),
  });
}

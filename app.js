import { AnimalAlbum, illustration } from './animals.js';
import { updateGaze, resetGaze } from './gaze.js';
import { habitatFor } from './habitats.js';
import { isAnimalInput, PlayState } from './play-state.js';
import { acquireKeyboardProtection } from './keyboard-protection.js';

const $ = id => document.getElementById(id);

// Pre-cached DOM element references for 60fps performance and zero GC churn
const readinessEl = $('readiness');
const readinessFillEl = $('readiness-fill');
const readinessLabelEl = $('readiness-label');
const illustrationEl = $('illustration');
const stageCaptionEl = $('stage-caption');
const stageEl = $('stage');
const stageHintEl = $('stage-hint');
const stageHintKbd = stageHintEl?.querySelector('kbd');
const stageHintSpan = stageHintEl?.querySelector('span');
const animalContentEl = $('animal-content');
const letterEl = $('letter');
const animalNameEl = $('animal-name');
const noticeEl = $('notice');
const soundCheckbox = $('sound');
const sceneryCheckbox = $('scenery');
const fullscreenCheckbox = $('fullscreen');
const settingSceneryCheckbox = $('setting-scenery');
const durationSelect = $('duration');
const parentButton = $('parent-button');
const startButton = $('start');
const resumeButton = $('resume');
const stopButton = $('stop');
const welcomeSection = $('welcome');
const finishSection = $('finish');
const playInstructionsSection = $('play-instructions');
const pausedDialog = $('paused');
const settingsDialog = $('settings');
const protectionErrorEl = $('protection-error');
const pauseDetailEl = $('pause-detail');
const lockStatusEl = $('lock-status');
const sessionClockEl = $('session-clock');
const voiceNoteEl = $('voice-note');
const touchNoteEl = $('touch-note');

const state = new PlayState();
const synth = window.speechSynthesis;
let phase = 'welcome';
const album = new AnimalAlbum();
let currentAnimal = album.current;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const hasKeyboardLock = Boolean(navigator.keyboard?.lock);

// Touch-first devices start in a window without requiring keyboard protection.
if (window.matchMedia('(pointer: coarse)').matches) {
  if (fullscreenCheckbox) fullscreenCheckbox.checked = false;
  if (touchNoteEl) touchNoteEl.hidden = false;
}

// On platforms where Keyboard Lock API is unavailable (Android TV, mobile, Safari, Firefox),
// adapt the switch label from "Pełny ekran i blokada" to "Pełny ekran".
if (!hasKeyboardLock) {
  const fullscreenLabel = fullscreenCheckbox?.closest('label');
  if (fullscreenLabel) {
    for (const node of fullscreenLabel.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('Pełny ekran')) {
        node.textContent = ' Pełny ekran';
      }
    }
  }
}

const READINESS_LABELS = Object.freeze({
  ready: 'Można dalej',
  waiting: 'Chwila przerwy',
  speaking: 'Słuchamy',
  inactive: 'Przerwa'
});

let readinessFrame;
let lastReadinessProgress = -1;
let lastReadinessPhase = '';
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
let holdKey = null;
let holdBorder;
let noticeTimer;
let greetingTimer;
let debugPanel;
let pauseOpenedAt = 0;
let lastRenderedAnimal = null;
let lastRenderedScenery = null;

function updateReadiness() {
  cancelAnimationFrame(readinessFrame);
  if (!readinessEl) return;
  readinessEl.hidden = phase !== 'playing';
  if (readinessEl.hidden) return;

  const status = state.readiness();
  const label = READINESS_LABELS[status.phase] || '';

  if (lastReadinessPhase !== status.phase) {
    lastReadinessPhase = status.phase;
    readinessEl.dataset.state = status.phase;
    readinessEl.setAttribute('aria-valuetext', label);
    if (readinessLabelEl.textContent !== label) readinessLabelEl.textContent = label;
  }

  const progress = reducedMotion.matches && status.phase !== 'ready' ? 0 : status.progress;
  const roundedProgress = Math.round(progress * 100);

  if (status.phase === 'speaking') {
    readinessEl.removeAttribute('aria-valuenow');
  } else if (lastReadinessProgress !== roundedProgress) {
    readinessEl.setAttribute('aria-valuenow', roundedProgress);
  }

  if (lastReadinessProgress !== progress) {
    lastReadinessProgress = progress;
    readinessFillEl.setAttribute('stroke-dashoffset', 100 * (1 - progress));
  }

  if (status.phase === 'waiting') readinessFrame = requestAnimationFrame(updateReadiness);
}
reducedMotion.addEventListener('change', updateReadiness);

function updateVoices() {
  const voices = synth?.getVoices() || [];
  const polish = voices.filter(voice => /^pl(?:[-_]|$)/i.test(voice.lang));
  polishVoice = polish.find(voice => voice.localService) || polish[0] || null;
  if (voiceNoteEl) {
    voiceNoteEl.textContent = polishVoice
      ? (polishVoice.localService ? 'Polski głos jest dostępny na tym urządzeniu.' : 'Polski głos może wymagać połączenia z internetem.')
      : 'Brak polskiego głosu na tym urządzeniu. Możecie sami nazywać zwierzątka lub doinstalować polski głos w systemie.';
  }
}
synth?.addEventListener('voiceschanged', updateVoices);
updateVoices();

function notice(message) {
  clearTimeout(noticeTimer);
  if (!noticeEl) return;
  noticeEl.textContent = message;
  noticeEl.hidden = false;
  noticeTimer = setTimeout(() => { noticeEl.hidden = true; }, 6500);
}

function cancelSpeech() {
  speechVersion++;
  clearTimeout(speechTimeout);
  if (activeUtterance) synth?.cancel();
  activeUtterance = null;
  state.speaking = false;
}

function speak(animal) {
  if (!soundCheckbox.checked || !polishVoice || !synth) return;
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
  const scenery = sceneryCheckbox.checked;
  if (currentAnimal === lastRenderedAnimal && scenery === lastRenderedScenery) return;
  lastRenderedAnimal = currentAnimal;
  lastRenderedScenery = scenery;

  const habitat = habitatFor(currentAnimal);
  illustrationEl.innerHTML = illustration(currentAnimal, { scenery });
  illustrationEl.setAttribute('aria-label', `Ilustracja: ${currentAnimal.name}${scenery ? ` — ${habitat.label.toLocaleLowerCase('pl')}` : ''}`);
  stageCaptionEl.textContent = scenery ? habitat.label.toLocaleUpperCase('pl') : (phase === 'welcome' ? 'POZNAJMY SIĘ' : 'MAŁE SPOTKANIA');
  stageEl.classList.toggle('with-scenery', scenery);
}

for (const el of [sceneryCheckbox, settingSceneryCheckbox]) {
  el?.addEventListener('change', () => {
    const enabled = el.checked;
    sceneryCheckbox.checked = enabled;
    settingSceneryCheckbox.checked = enabled;
    renderAppearance();
  });
}

function showAnimal(animal, animate = true) {
  currentAnimal = animal;
  letterEl.replaceChildren(document.createTextNode(animal.key.toLocaleUpperCase('pl')));
  const lowercase = document.createElement('span');
  lowercase.textContent = animal.key;
  letterEl.append(lowercase);
  animalNameEl.textContent = animal.name;
  renderAppearance();
  if (stageHintKbd) stageHintKbd.textContent = animal.inputKey.toUpperCase();
  if (stageHintSpan) stageHintSpan.textContent = `${animal.name} — spróbuj innego klawisza.`;
  animalContentEl.classList.remove('appearing', 'greeting');
  if (animate) {
    void animalContentEl.offsetWidth;
    animalContentEl.classList.add('appearing');
  }
}

function greet() {
  clearTimeout(greetingTimer);
  animalContentEl.classList.remove('greeting', 'appearing');
  void animalContentEl.offsetWidth;
  animalContentEl.classList.add('greeting');
  greetingTimer = setTimeout(() => animalContentEl.classList.remove('greeting'), 1400);
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
  holdKey = null;
  holdBorder?.remove();
  holdBorder = null;
  parentButton?.classList.remove('holding');
}

function triggerHoldAnimation(onComplete) {
  cancelParentHold();
  if (!parentButton) return;
  const { width: w, height: h } = parentButton.getBoundingClientRect();
  const r = Math.max(1, h / 2 - 1);
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
  parentButton.append(holdBorder);
  parentButton.classList.add('holding');
  holdTimer = setTimeout(() => {
    cancelParentHold();
    onComplete();
  }, parentHoldDuration);
}

function startParentHold(event) {
  if (!['playing', 'finished'].includes(phase) || event.button !== 0 || !event.isPrimary) return;
  event.preventDefault();
  holdPointerId = event.pointerId;
  triggerHoldAnimation(() => phase === 'finished' ? returnToWelcome() : pause());
}

function releaseParentHold(event) {
  if (event.pointerId === holdPointerId) cancelParentHold();
}

function isBackKey(event) {
  return event.key === 'Escape' || event.key === 'GoBack' || event.key === 'BrowserBack' || event.keyCode === 4 || event.keyCode === 27;
}

function releaseKeyboard() {
  try { navigator.keyboard?.unlock(); } catch { /* Browser has already released it. */ }
  locked = false;
}

async function protectKeyboard() {
  if (!wantsFullscreen) {
    const message = 'Zabawa w oknie. Skróty przeglądarki i systemu mogą być aktywne.';
    if (lockStatusEl) lockStatusEl.textContent = message;
    notice(message);
    return { locked: false, allowed: true };
  }

  if (!hasKeyboardLock) {
    if (document.fullscreenEnabled && document.documentElement.requestFullscreen && !document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Fullscreen request denied or unavailable in container; proceed in window.
      }
    }
    const isFullscreen = Boolean(document.fullscreenElement);
    const message = isFullscreen
      ? 'Zabawa w trybie pełnoekranowym.'
      : 'Zabawa w oknie.';
    if (lockStatusEl) lockStatusEl.textContent = message;
    return { locked: false, allowed: true, reason: message };
  }

  const result = await acquireKeyboardProtection({ document, keyboard: navigator.keyboard, secureContext: window.isSecureContext });
  locked = result.locked;
  if (lockStatusEl) {
    lockStatusEl.textContent = locked
      ? 'Przeglądarka włączyła przechwytywanie wszystkich dostępnych jej klawiszy. Klawisz Windows/Super i część skrótów nadal mogą być zarezerwowane przez system.'
      : result.reason;
  }
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
  if (sessionClockEl && sessionClockEl.textContent !== label) sessionClockEl.textContent = label;
}

async function begin(resuming = false) {
  if (!['welcome','paused'].includes(phase)) return;
  phase = 'starting';
  cancelSpeech();
  startButton.disabled = true;
  resumeButton.disabled = true;
  pausedDialog.close();
  if (protectionErrorEl) protectionErrorEl.hidden = true;
  if (!resuming) {
    remaining = Number(durationSelect.value) * 60_000;
    wantsFullscreen = fullscreenCheckbox.checked;
  }
  const protection = await protectKeyboard();
  if (phase !== 'starting') return;
  if (!protection.allowed) {
    releaseKeyboard();
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    startButton.disabled = false;
    resumeButton.disabled = false;
    const explanation = `${protection.reason} Zabawa nie została uruchomiona bez wybranej blokady.`;
    if (resuming) {
      phase = 'paused';
      if (pauseDetailEl) pauseDetailEl.textContent = `${explanation} Spróbuj ponownie lub zakończ zabawę, aby zmienić ustawienia.`;
      pausedDialog.showModal();
    } else {
      phase = 'welcome';
      if (protectionErrorEl) {
        protectionErrorEl.textContent = `${explanation} Spróbuj ponownie. Jeśli chcesz bawić się bez blokady, wyłącz opcję „Pełny ekran i blokada”.`;
        protectionErrorEl.hidden = false;
      }
    }
    return;
  }
  if (!resuming) showAnimal(album.reset(), false);
  welcomeSection.hidden = true;
  finishSection.hidden = true;
  playInstructionsSection.hidden = false;
  renderAppearance();
  parentButton.textContent = 'Dla rodzica · przytrzymaj';
  parentButton.setAttribute('aria-label', 'Przytrzymaj przez 2 sekundy lub naciśnij Esc, aby wstrzymać zabawę');
  document.body.classList.add('playing');
  phase = 'playing';
  state.start();
  startClock();
  startButton.disabled = false;
  resumeButton.disabled = false;
  if (document.hidden || !document.hasFocus()) { pause(); return; }
  if (!resuming && soundCheckbox.checked && polishVoice && state.accept()) speak(currentAnimal);
  updateReadiness();
}

function pause() {
  if (phase !== 'playing') return;
  remaining = Math.max(0, endAt - performance.now());
  if (remaining === 0) { finish(); return; }
  phase = 'paused';
  pauseOpenedAt = performance.now();
  clearTimeout(sessionTimer);
  clearInterval(clockTimer);
  cancelParentHold();
  state.stop();
  cancelSpeech();
  releaseKeyboard();
  updateReadiness();
  if (pauseDetailEl) pauseDetailEl.textContent = 'Na czas przerwy blokada klawiatury jest zwolniona. Przy wznowieniu spróbujemy włączyć ją ponownie, jeśli wybrano pełny ekran.';
  if (lockStatusEl) lockStatusEl.textContent = 'Zabawa jest wstrzymana. Blokada klawiatury jest zwolniona.';
  pausedDialog.showModal();
  setTimeout(() => resumeButton.focus(), 50);
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
  pausedDialog.close();
  welcomeSection.hidden = true;
  finishSection.hidden = false;
  playInstructionsSection.hidden = true;
  stageCaptionEl.textContent = 'DO ZOBACZENIA';
  if (stageHintEl) stageHintEl.hidden = true;
  if (noticeEl) noticeEl.hidden = true;
  animalContentEl.classList.remove('greeting', 'appearing');
  resetGaze(stageEl);
  document.body.classList.remove('playing');
  document.body.classList.add('sleeping');
  stageEl.hidden = true;
  parentButton.textContent = 'Dla rodzica · przytrzymaj';
  parentButton.setAttribute('aria-label', 'Przytrzymaj przez 2 sekundy lub naciśnij Esc, aby wrócić do początku');
  setTimeout(() => parentButton.focus(), 50);
}

startButton.addEventListener('click', () => begin());
resumeButton.addEventListener('click', () => begin(true));
stopButton.addEventListener('click', returnToWelcome);

function returnToWelcome() {
  phase = 'welcome';
  state.stop();
  clearTimeout(sessionTimer);
  clearInterval(clockTimer);
  clearTimeout(greetingTimer);
  clearTimeout(noticeTimer);
  cancelParentHold();
  cancelSpeech();
  resetGaze(stageEl);
  releaseKeyboard();
  remaining = 0;
  endAt = 0;
  updateReadiness();
  pausedDialog.close();
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  document.body.classList.remove('playing', 'sleeping');
  finishSection.hidden = true;
  welcomeSection.hidden = false;
  playInstructionsSection.hidden = true;
  if (noticeEl) noticeEl.hidden = true;
  if (protectionErrorEl) protectionErrorEl.hidden = true;
  startButton.disabled = false;
  resumeButton.disabled = false;
  stageEl.hidden = false;
  if (stageHintEl) stageHintEl.hidden = false;
  stageCaptionEl.textContent = 'POZNAJMY SIĘ';
  parentButton.textContent = 'Dla rodzica';
  parentButton.setAttribute('aria-label', 'Dla rodzica');
  if (lockStatusEl) lockStatusEl.textContent = 'Zabawa jest zakończona. Blokada klawiatury jest zwolniona.';
  showAnimal(album.reset(), false);
  startButton.focus();
}

$('settings-done').addEventListener('click', () => settingsDialog.close());
parentButton.addEventListener('click', () => {
  if (phase === 'welcome') {
    settingsDialog.showModal();
    settingSceneryCheckbox.focus();
  }
});
parentButton.addEventListener('pointerdown', startParentHold);
parentButton.addEventListener('pointerleave', releaseParentHold);
for (const name of ['pointerup','pointercancel']) window.addEventListener(name, releaseParentHold);

// Touch pointers may retain implicit capture after moving outside the button.
parentButton.addEventListener('pointermove', event => {
  if (event.pointerId !== holdPointerId) return;
  const rect = parentButton.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) cancelParentHold();
});
window.addEventListener('resize', cancelParentHold);
pausedDialog.addEventListener('cancel', event => event.preventDefault());
soundCheckbox.addEventListener('change', () => {
  cancelSpeech();
  updateVoices();
  if (soundCheckbox.checked && polishVoice) speak(currentAnimal);
});

window.addEventListener('keydown', event => {
  debugPanel?.recordKey(event);

  if (phase === 'starting') {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  if (phase === 'paused') {
    event.stopImmediatePropagation();
    if (performance.now() - pauseOpenedAt < 400) {
      event.preventDefault();
      return;
    }
    if (isBackKey(event)) {
      event.preventDefault();
      begin(true);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Tab') {
      event.preventDefault();
      if (document.activeElement === stopButton) resumeButton.focus();
      else stopButton.focus();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (document.activeElement === stopButton) returnToWelcome();
      else begin(true);
      return;
    }
    event.preventDefault();
    return;
  }

  if (phase === 'finished') {
    event.stopImmediatePropagation();
    if (isBackKey(event)) {
      event.preventDefault();
      returnToWelcome();
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ' || event.key === 'p' || event.key === 'P') && !event.repeat) {
      event.preventDefault();
      if (!holdKey) {
        holdKey = event.key;
        triggerHoldAnimation(returnToWelcome);
      }
      return;
    }
    event.preventDefault();
    return;
  }

  if (phase === 'welcome') {
    if (settingsDialog.open) {
      if (isBackKey(event)) {
        event.preventDefault();
        settingsDialog.close();
        parentButton.focus();
        return;
      }
      const settingControls = [
        settingsDialog.querySelector('.close-button'),
        settingSceneryCheckbox,
        durationSelect,
        $('settings-done')
      ].filter(Boolean);
      if (event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey)) {
        event.preventDefault();
        const idx = settingControls.indexOf(document.activeElement);
        const next = settingControls[(idx + 1) % settingControls.length];
        next?.focus();
        return;
      }
      if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
        event.preventDefault();
        const idx = settingControls.indexOf(document.activeElement);
        const prev = settingControls[(idx - 1 + settingControls.length) % settingControls.length];
        prev?.focus();
        return;
      }
      if (document.activeElement === settingSceneryCheckbox && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        settingSceneryCheckbox.checked = !settingSceneryCheckbox.checked;
        settingSceneryCheckbox.dispatchEvent(new Event('change'));
        return;
      }
      if (document.activeElement === durationSelect) {
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault();
          if (durationSelect.selectedIndex < durationSelect.options.length - 1) durationSelect.selectedIndex++;
          else durationSelect.selectedIndex = 0;
          durationSelect.dispatchEvent(new Event('change'));
          return;
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault();
          if (durationSelect.selectedIndex > 0) durationSelect.selectedIndex--;
          else durationSelect.selectedIndex = durationSelect.options.length - 1;
          durationSelect.dispatchEvent(new Event('change'));
          return;
        }
      }
      if ((document.activeElement === $('settings-done') || document.activeElement === settingsDialog.querySelector('.close-button')) && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        settingsDialog.close();
        parentButton.focus();
        return;
      }
      return;
    }

    if (event.key === 'p' || event.key === 'P' || event.key === 'F1') {
      event.preventDefault();
      settingsDialog.showModal();
      settingSceneryCheckbox.focus();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      if (document.activeElement === startButton) {
        return;
      }
      if (['sound', 'fullscreen', 'scenery'].includes(document.activeElement?.id)) {
        event.preventDefault();
        document.activeElement.checked = !document.activeElement.checked;
        document.activeElement.dispatchEvent(new Event('change'));
        return;
      }
      if (document.activeElement === parentButton) {
        event.preventDefault();
        settingsDialog.showModal();
        settingSceneryCheckbox.focus();
        return;
      }
      if (!['BUTTON', 'A', 'INPUT', 'SELECT'].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        begin();
        return;
      }
    }
    if (document.activeElement === startButton) {
      if (event.key === 'ArrowDown') { event.preventDefault(); soundCheckbox.focus(); return; }
      if (event.key === 'ArrowUp') { event.preventDefault(); parentButton.focus(); return; }
    } else if (document.activeElement === soundCheckbox) {
      if (event.key === 'ArrowRight') { event.preventDefault(); fullscreenCheckbox.focus(); return; }
      if (event.key === 'ArrowUp') { event.preventDefault(); startButton.focus(); return; }
      if (event.key === 'ArrowDown') { event.preventDefault(); document.querySelector('.footer-links a')?.focus(); return; }
    } else if (document.activeElement === fullscreenCheckbox) {
      if (event.key === 'ArrowLeft') { event.preventDefault(); soundCheckbox.focus(); return; }
      if (event.key === 'ArrowRight') { event.preventDefault(); sceneryCheckbox.focus(); return; }
      if (event.key === 'ArrowUp') { event.preventDefault(); startButton.focus(); return; }
      if (event.key === 'ArrowDown') { event.preventDefault(); document.querySelector('.footer-links a')?.focus(); return; }
    } else if (document.activeElement === sceneryCheckbox) {
      if (event.key === 'ArrowLeft') { event.preventDefault(); fullscreenCheckbox.focus(); return; }
      if (event.key === 'ArrowUp') { event.preventDefault(); startButton.focus(); return; }
      if (event.key === 'ArrowDown') { event.preventDefault(); document.querySelector('.footer-links a')?.focus(); return; }
    } else if (document.activeElement === parentButton) {
      if (event.key === 'ArrowDown') { event.preventDefault(); startButton.focus(); return; }
      if (event.key === 'ArrowLeft') { event.preventDefault(); document.querySelector('.brand')?.focus(); return; }
    } else if (document.activeElement?.matches?.('.brand')) {
      if (event.key === 'ArrowRight') { event.preventDefault(); parentButton.focus(); return; }
      if (event.key === 'ArrowDown') { event.preventDefault(); startButton.focus(); return; }
    } else if (document.activeElement?.matches?.('.footer-links a')) {
      if (event.key === 'ArrowUp') { event.preventDefault(); sceneryCheckbox.focus(); return; }
      if (event.key === 'ArrowLeft') { event.preventDefault(); startButton.focus(); return; }
    }
    return;
  }

  if (phase !== 'playing') return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (performance.now() >= endAt) { finish(); return; }
  if (isBackKey(event)) {
    pause();
    return;
  }
  if ((event.key === 'p' || event.key === 'P' || (document.activeElement === parentButton && (event.key === 'Enter' || event.key === ' '))) && !event.repeat) {
    if (!holdKey) {
      holdKey = event.key;
      triggerHoldAnimation(pause);
    }
    return;
  }
  if (!isAnimalInput(event)) return;
  discoverAnimal(event.key, event);
}, { capture: true });

for (const type of ['keyup','keypress']) window.addEventListener(type, event => {
  if (holdKey && event.key === holdKey) {
    holdKey = null;
    cancelParentHold();
  }
  if (['playing','paused','starting','finished'].includes(phase)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, { capture: true });

for (const type of ['contextmenu','wheel','dragstart']) window.addEventListener(type, event => {
  if (phase === 'playing' || phase === 'finished') event.preventDefault();
}, { capture: true, passive: false });

function followPointer(event) {
  if (phase === 'playing' && (event.pointerType === 'mouse' || event.isPrimary)) updateGaze(stageEl, event);
}
for (const type of ['pointermove', 'pointerover']) window.addEventListener(type, followPointer, { capture: true, passive: true });
for (const type of ['pointerup', 'pointercancel']) window.addEventListener(type, event => {
  if (event.isPrimary && event.pointerType !== 'mouse') resetGaze(stageEl);
}, { capture: true, passive: true });
document.querySelector('main').addEventListener('pointerdown', event => {
  if (phase === 'playing') {
    event.preventDefault();
    if (event.isPrimary && event.button === 0) discoverAnimal(' ');
  }
});
document.addEventListener('fullscreenchange', () => {
  if (phase === 'playing' && !document.fullscreenElement) pause();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pause();
});
window.addEventListener('blur', () => { resetGaze(stageEl); cancelParentHold(); pause(); });
window.addEventListener('pagehide', () => { clearTimeout(sessionTimer); clearInterval(clockTimer); cancelAnimationFrame(readinessFrame); cancelParentHold(); cancelSpeech(); releaseKeyboard(); state.stop(); });
window.addEventListener('pageshow', event => {
  if (event.persisted && phase === 'playing') pause();
});
showAnimal(currentAnimal, false);
setTimeout(() => startButton?.focus(), 50);

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

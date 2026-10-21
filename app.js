import { AnimalAlbum, illustration, animals } from './animals.js';
import { updateGaze, resetGaze } from './gaze.js';
import { habitatFor } from './habitats.js';
import { isAnimalInput, PlayState } from './play-state.js';
import { acquireKeyboardProtection } from './keyboard-protection.js';
import { QuizEngine } from './quiz-engine.js';
import { CollectionManager } from './collection.js';
import { getFactForAnimal } from './animal-facts.js';
import { playCorrect, playStar, playFanfare, playTryAgain, playClick, playCardUnlock, setSoundEnabled } from './sfx.js';
import { KeyboardMapHelper } from './keyboard-map.js';
import { MemoryGame } from './memory-game.js';

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

// New Educational & Quiz DOM references
const starsBadge = $('stars-badge');
const starsCountEl = $('stars-count');
const cardsButton = $('cards-button');
const cardsLabelEl = $('cards-label');
const modeSelector = $('mode-selector');
const quizOverlayEl = $('quiz-overlay');
const quizModeNameEl = $('quiz-mode-name');
const quizPromptTextEl = $('quiz-prompt-text');
const quizOptionsEl = $('quiz-options');
const spellingSlotsEl = $('spelling-slots');
const quizCelebrationEl = $('quiz-celebration');
const celebrationTextEl = $('celebration-text');
const cardsDialog = $('cards-dialog');
const cardsGridEl = $('cards-grid');
const cardsProgressFillEl = $('cards-progress-fill');
const cardsSummaryEl = $('cards-summary');
const cardsCloseBtn = $('cards-close-btn');
const cardDetailDialog = $('card-detail-dialog');
const cardDetailIllustrationEl = $('card-detail-illustration');
const cardDetailLetterEl = $('card-detail-letter');
const cardDetailNameEl = $('card-detail-name');
const cardDetailFactEl = $('card-detail-fact');
const cardDetailSpeakBtn = $('card-detail-speak');
const cardDetailCloseBtn = $('card-detail-close');
const lettersMasteryGridEl = $('letters-mastery-grid');
const resetStatsBtn = $('reset-stats-btn');

// Profile, Night mode, Keyboard map and Memory board DOM references
const profileBtn = $('profile-btn');
const profileNameEl = $('profile-name');
const nightBtn = $('night-btn');
const memoryBoardEl = $('memory-board');
const keyboardMapContainer = $('keyboard-map-container');
const settingProfileSelect = $('setting-profile');
const settingChildNameInput = $('setting-child-name');
const settingPhonicsSelect = $('setting-phonics');
const settingKeyboardHint = $('setting-keyboard-hint');
const settingNightMode = $('setting-night-mode');

const collection = new CollectionManager(animals);
const quizEngine = new QuizEngine(animals);
const keyboardHelper = new KeyboardMapHelper(keyboardMapContainer);
const memoryGame = new MemoryGame();
let selectedCardAnimal = null;

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

function speakText(text, onComplete) {
  if (!soundCheckbox.checked || !polishVoice || !synth) {
    if (onComplete) onComplete();
    return;
  }
  const version = ++speechVersion;
  state.speaking = true;
  updateReadiness();
  const utterance = new SpeechSynthesisUtterance(text);
  activeUtterance = utterance;
  utterance.voice = polishVoice;
  utterance.lang = 'pl-PL';
  utterance.rate = .84;
  utterance.pitch = 1.05;
  utterance.volume = .6;
  const complete = () => {
    if (version !== speechVersion) return;
    clearTimeout(speechTimeout);
    activeUtterance = null;
    state.speechEnded();
    updateReadiness();
    if (onComplete) onComplete();
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
    if (onComplete) onComplete();
  }, 7000);
  try { synth.speak(utterance); } catch { complete(); }
}

function speak(animal) {
  speakText(animal.name);
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
  if (quizEngine.mode === 'explore') {
    keyboardHelper.highlightTarget(animal.inputKey);
  }
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
  keyboardHelper.flashPress(key);
  const animal = album.next(key);
  if (animal !== currentAnimal) showAnimal(animal);
  else greet();
  speak(animal);
  updateReadiness();
}

function updateStarsBadge() {
  const activeProfile = collection.getActiveProfile();
  const displayName = activeProfile.childName ? activeProfile.childName : activeProfile.name;
  if (profileNameEl) profileNameEl.textContent = displayName;
  if (starsCountEl) starsCountEl.textContent = activeProfile.stars;
  if (cardsLabelEl) cardsLabelEl.textContent = `Album kart (${collection.getUnlockedCount()}/${collection.getTotalCardsCount()})`;
}

function applyNightMode(enabled) {
  document.body.classList.toggle('night-mode', enabled);
  if (nightBtn) nightBtn.textContent = enabled ? '☀️' : '🌙';
  if (settingNightMode) settingNightMode.checked = enabled;
  collection.setNightMode(enabled);
}

function switchProfile(profileId) {
  collection.switchProfile(profileId);
  quizEngine.setChildName(collection.getChildName());
  updateStarsBadge();
  if (settingProfileSelect) settingProfileSelect.value = profileId;
  if (settingChildNameInput) settingChildNameInput.value = collection.getChildName();
  const active = collection.getActiveProfile();
  notice(`Przełączono profil: ${active.childName || active.name}`);
}

function setupMemoryBoard() {
  if (!memoryBoardEl) return;
  const cards = memoryGame.start(animals, 3);
  memoryBoardEl.replaceChildren();
  memoryBoardEl.hidden = false;
  if (quizOptionsEl) quizOptionsEl.hidden = true;
  if (spellingSlotsEl) spellingSlotsEl.hidden = true;
  quizModeNameEl.textContent = 'PARY (MEMORY)';
  quizPromptTextEl.textContent = 'Dopasuj pary liter i zwierzątek!';
  stageCaptionEl.textContent = 'PARY (MEMORY)';
  animalContentEl.hidden = true;
  keyboardHelper.clearTarget();

  cards.forEach((card, idx) => {
    const cardBtn = document.createElement('button');
    cardBtn.type = 'button';
    cardBtn.className = 'memory-card back';
    cardBtn.dataset.index = idx;
    cardBtn.dataset.key = card.animal.key.toLowerCase();
    cardBtn.dataset.letter = (card.kind === 'letter' ? card.label : card.animal.key).toLowerCase();
    cardBtn.setAttribute('aria-label', `Karta ${idx + 1}`);

    const renderFront = () => {
      cardBtn.classList.remove('back');
      if (card.kind === 'letter') {
        cardBtn.innerHTML = `<span>${card.label}</span>`;
      } else {
        cardBtn.innerHTML = `<div class="memory-thumb">${illustration(card.animal, { scenery: false })}</div><span class="memory-label">${card.label}</span>`;
      }
    };

    cardBtn.addEventListener('click', () => {
      if (card.flipped || card.matched || memoryGame.isLocked) return;
      renderFront();
      playClick();
      const res = memoryGame.flip(idx);
      if (!res) return;

      if (res.status === 'match') {
        playCorrect();
        speakText(`Brawo! ${res.animal.name}!`);
        const idx1 = memoryGame.cards.findIndex(c => c.id === res.card1.id);
        const idx2 = memoryGame.cards.findIndex(c => c.id === res.card2.id);
        const matchedButtons = memoryBoardEl.querySelectorAll(`.memory-card[data-index="${idx1}"], .memory-card[data-index="${idx2}"]`);
        matchedButtons.forEach(b => b.classList.add('matched'));

        if (res.complete) {
          setTimeout(() => {
            playFanfare();
            collection.addStar();
            const { stars, unlockedAnimal } = collection.addStar();
            updateStarsBadge();
            if (quizCelebrationEl) quizCelebrationEl.hidden = false;
            if (celebrationTextEl) celebrationTextEl.textContent = 'Wszystkie pary! ⭐ +2';
            if (unlockedAnimal) {
              setTimeout(() => {
                notice(`🎉 Odblokowano nową kartę: ${unlockedAnimal.name}!`);
              }, 400);
            }
            speakText('Wspaniale! Wszystkie pary dopasowane!', () => {
              setTimeout(() => {
                if (quizCelebrationEl) quizCelebrationEl.hidden = true;
                if (phase === 'playing') setupMemoryBoard();
              }, 1600);
            });
          }, 400);
        }
      } else if (res.status === 'mismatch') {
        playTryAgain();
        setTimeout(() => {
          memoryGame.resolveMismatch();
          const buttons = memoryBoardEl.querySelectorAll('.memory-card:not(.matched)');
          buttons.forEach(b => {
            b.classList.add('back');
            b.innerHTML = '';
          });
        }, 850);
      }
    });

    memoryBoardEl.appendChild(cardBtn);
  });

  speakText('Dopasuj pary liter i zwierzątek!');
  setTimeout(() => memoryBoardEl.querySelector('.memory-card')?.focus(), 80);
}

function renderQuizOptions(options, targetChar) {
  if (!quizOptionsEl) return;
  quizOptionsEl.replaceChildren();
  for (const opt of options) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quiz-option-btn';
    btn.dataset.letter = opt;
    btn.textContent = opt;
    btn.setAttribute('aria-label', `Wybierz literkę ${opt}`);
    btn.addEventListener('click', () => handleQuizInput(opt));
    quizOptionsEl.appendChild(btn);
  }
  setTimeout(() => quizOptionsEl.querySelector('.quiz-option-btn')?.focus(), 80);
}

function renderSpellingSlots(question) {
  if (!spellingSlotsEl) return;
  spellingSlotsEl.replaceChildren();
  for (let i = 0; i < question.letters.length; i++) {
    const isFilled = i < question.stepIndex;
    const isCurrent = i === question.stepIndex;
    const slot = document.createElement('div');
    slot.className = `spelling-slot ${isFilled ? 'filled' : ''} ${isCurrent ? 'active-slot' : ''}`;
    slot.textContent = isFilled ? question.letters[i] : (isCurrent ? '_' : '');
    spellingSlotsEl.appendChild(slot);
  }
}

function setupQuizQuestion() {
  if (quizEngine.mode === 'explore') {
    if (quizOverlayEl) quizOverlayEl.hidden = true;
    if (animalContentEl) animalContentEl.hidden = false;
    keyboardHelper.clearTarget();
    showAnimal(currentAnimal);
    return;
  }

  if (quizEngine.mode === 'memory') {
    if (quizCelebrationEl) quizCelebrationEl.hidden = true;
    if (quizOverlayEl) quizOverlayEl.hidden = false;
    setupMemoryBoard();
    return;
  }

  const q = quizEngine.nextQuestion();
  if (!q) return;

  if (quizCelebrationEl) quizCelebrationEl.hidden = true;
  if (quizOverlayEl) quizOverlayEl.hidden = false;
  if (memoryBoardEl) memoryBoardEl.hidden = true;
  animalContentEl.hidden = false;

  keyboardHelper.highlightTarget(q.targetChar || (q.letters && q.letters[q.stepIndex]));

  if (q.type === 'guess-letter') {
    quizModeNameEl.textContent = 'ZGADNIJ LITERKĘ';
    quizPromptTextEl.textContent = q.prompt;
    spellingSlotsEl.hidden = true;
    quizOptionsEl.hidden = false;
    renderQuizOptions(q.options, q.targetChar);
    letterEl.replaceChildren(document.createTextNode('?'));
    illustrationEl.innerHTML = '<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="70" fill="#d8dfcd"/><text x="100" y="125" font-family="Georgia" font-size="75" font-weight="bold" fill="#50694e" text-anchor="middle">?</text></svg>';
    animalNameEl.textContent = '???';
    stageCaptionEl.textContent = 'ZGADNIJ LITERKĘ';
    speakText(q.speech);
  } else if (q.type === 'first-letter') {
    quizModeNameEl.textContent = 'PIERWSZA LITERA';
    quizPromptTextEl.textContent = q.prompt;
    spellingSlotsEl.hidden = true;
    quizOptionsEl.hidden = false;
    renderQuizOptions(q.options, q.targetChar);
    showAnimal(q.animal);
    stageCaptionEl.textContent = 'PIERWSZA LITERA';
    speakText(q.speech);
  } else if (q.type === 'spelling') {
    quizModeNameEl.textContent = 'NAPISZ SŁOWO';
    quizPromptTextEl.textContent = q.prompt;
    quizOptionsEl.hidden = true;
    spellingSlotsEl.hidden = false;
    renderSpellingSlots(q);
    showAnimal(q.animal);
    stageCaptionEl.textContent = 'NAPISZ SŁOWO';
    speakText(q.speech);
  }
}

function handleQuizInput(key) {
  if (phase !== 'playing' || quizEngine.mode === 'explore') return;
  if (!quizEngine.currentQuestion) return;

  keyboardHelper.flashPress(key);

  const res = quizEngine.checkInput(key);
  if (!res) return;

  if (res.correct) {
    if (res.finished) {
      playCorrect();
      collection.recordAnswer(res.animal.key, true);
      const { stars, unlockedAnimal } = collection.addStar();
      updateStarsBadge();

      showAnimal(res.animal);
      if (quizCelebrationEl) quizCelebrationEl.hidden = false;
      if (celebrationTextEl) celebrationTextEl.textContent = 'Brawo! ⭐ +1';

      if (unlockedAnimal) {
        setTimeout(() => {
          playFanfare();
          notice(`🎉 Odblokowano nową kartę: ${unlockedAnimal.name}!`);
        }, 400);
      } else {
        playStar();
      }

      speakText(res.speech, () => {
        setTimeout(() => {
          if (quizCelebrationEl) quizCelebrationEl.hidden = true;
          if (phase === 'playing') setupQuizQuestion();
        }, 1300);
      });
    } else {
      // Intermediate spelling step
      playCorrect();
      renderSpellingSlots(quizEngine.currentQuestion);
      const nextChar = quizEngine.currentQuestion.letters?.[quizEngine.currentQuestion.stepIndex];
      keyboardHelper.highlightTarget(nextChar);
      speakText(res.speech);
    }
  } else {
    // Incorrect answer
    playTryAgain();
    collection.recordAnswer(quizEngine.currentQuestion.targetChar || quizEngine.currentQuestion.animal?.key, false);

    const btns = quizOptionsEl?.querySelectorAll('.quiz-option-btn') || [];
    for (const b of btns) {
      if (b.dataset.letter?.toLowerCase() === key?.toLowerCase()) {
        b.classList.add('wrong');
        setTimeout(() => b.classList.remove('wrong'), 450);
      }
    }
    quizPromptTextEl?.classList.add('wrong');
    setTimeout(() => quizPromptTextEl?.classList.remove('wrong'), 450);

    speakText(res.speech);
  }
}

function openCardsAlbum() {
  renderCardsGrid();
  cardsDialog.showModal();
  setTimeout(() => {
    const firstCard = cardsGridEl?.querySelector('.card-item:not(.locked)');
    (firstCard || cardsCloseBtn)?.focus();
  }, 60);
}

function renderCardsGrid() {
  if (!cardsGridEl) return;
  cardsGridEl.replaceChildren();
  const unlockedCount = collection.getUnlockedCount();
  const totalCount = collection.getTotalCardsCount();
  if (cardsSummaryEl) cardsSummaryEl.textContent = `Odblokowano: ${unlockedCount} / ${totalCount} kart (⭐ ${collection.getStars()})`;
  if (cardsProgressFillEl) cardsProgressFillEl.style.width = `${Math.round((unlockedCount / totalCount) * 100)}%`;

  for (const animal of animals) {
    const isUnlocked = collection.isCardUnlocked(animal);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `card-item ${isUnlocked ? '' : 'locked'}`;
    card.setAttribute('aria-label', isUnlocked ? `Karta: ${animal.name}` : 'Zablokowana karta');
    if (isUnlocked) {
      card.innerHTML = `<span class="card-letter-badge">${animal.key.toUpperCase()}</span><div class="card-thumb">${illustration(animal, { scenery: false })}</div><span class="card-title">${animal.name}</span>`;
      card.addEventListener('click', () => openCardDetail(animal));
    } else {
      card.innerHTML = `<span class="card-letter-badge">?</span><div class="card-thumb"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#ccd4c3"/><text x="20" y="25" font-family="Georgia" font-size="16" fill="#88967f" text-anchor="middle">?</text></svg></div><span class="card-title">Zablokowana</span>`;
    }
    cardsGridEl.appendChild(card);
  }
}

function openCardDetail(animal) {
  selectedCardAnimal = animal;
  if (!cardDetailDialog) return;
  cardDetailIllustrationEl.innerHTML = illustration(animal, { scenery: false });
  cardDetailLetterEl.textContent = animal.key.toUpperCase();
  cardDetailNameEl.textContent = animal.name;
  const fact = getFactForAnimal(animal);
  cardDetailFactEl.textContent = fact;
  cardDetailDialog.showModal();
  setTimeout(() => cardDetailSpeakBtn?.focus(), 60);
  speakText(fact);
}

function renderMasteryGrid() {
  if (!lettersMasteryGridEl) return;
  lettersMasteryGridEl.replaceChildren();
  const stats = collection.getStatsSummary();
  for (const item of stats) {
    const cell = document.createElement('div');
    cell.className = `letter-mastery-cell ${item.status}`;
    cell.title = item.status === 'untested' ? 'Jeszcze niećwiczona' : `Skuteczność: ${item.rate}% (${item.correct}/${item.total})`;
    cell.textContent = item.letter.toUpperCase();
    lettersMasteryGridEl.appendChild(cell);
  }
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
  if (!resuming) {
    if (quizEngine.mode === 'explore') {
      showAnimal(album.reset(), false);
    } else {
      setupQuizQuestion();
    }
  }
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
  if (!resuming && soundCheckbox.checked && polishVoice && state.accept()) {
    if (quizEngine.mode === 'explore') speak(currentAnimal);
  }
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
  if (quizOverlayEl) quizOverlayEl.hidden = true;
  if (quizCelebrationEl) quizCelebrationEl.hidden = true;
  if (memoryBoardEl) memoryBoardEl.hidden = true;
  keyboardHelper.clearTarget();
  if (animalContentEl) animalContentEl.hidden = false;
  if (stageHintEl) stageHintEl.hidden = false;
  stageCaptionEl.textContent = 'POZNAJMY SIĘ';
  parentButton.textContent = 'Dla rodzica';
  parentButton.setAttribute('aria-label', 'Dla rodzica');
  if (lockStatusEl) lockStatusEl.textContent = 'Zabawa jest zakończona. Blokada klawiatury jest zwolniona.';
  showAnimal(album.reset(), false);
  updateStarsBadge();
  startButton.focus();
}

function openSettings() {
  if (settingProfileSelect) settingProfileSelect.value = collection.getActiveProfileId();
  if (settingChildNameInput) settingChildNameInput.value = collection.getChildName();
  if (settingPhonicsSelect) settingPhonicsSelect.value = collection.getPhonicsMode();
  if (settingKeyboardHint) settingKeyboardHint.checked = collection.isKeyboardHint();
  if (settingNightMode) settingNightMode.checked = collection.isNightMode();
  renderMasteryGrid();
  settingsDialog.showModal();
  (settingProfileSelect || settingSceneryCheckbox)?.focus();
}

$('settings-done').addEventListener('click', () => settingsDialog.close());
parentButton.addEventListener('click', () => {
  if (phase === 'welcome') openSettings();
});

profileBtn?.addEventListener('click', () => {
  const currentId = collection.getActiveProfileId();
  const nextId = currentId === 'profile_1' ? 'profile_2' : 'profile_1';
  switchProfile(nextId);
});

nightBtn?.addEventListener('click', () => {
  applyNightMode(!collection.isNightMode());
});

settingProfileSelect?.addEventListener('change', () => {
  switchProfile(settingProfileSelect.value);
});

settingChildNameInput?.addEventListener('input', () => {
  collection.setChildName(settingChildNameInput.value);
  quizEngine.setChildName(settingChildNameInput.value);
  updateStarsBadge();
});

settingPhonicsSelect?.addEventListener('change', () => {
  collection.setPhonicsMode(settingPhonicsSelect.value);
  quizEngine.setPhonicsMode(settingPhonicsSelect.value);
});

settingKeyboardHint?.addEventListener('change', () => {
  collection.setKeyboardHint(settingKeyboardHint.checked);
  keyboardHelper.setEnabled(settingKeyboardHint.checked);
});

settingNightMode?.addEventListener('change', () => {
  applyNightMode(settingNightMode.checked);
});

cardsButton?.addEventListener('click', openCardsAlbum);
starsBadge?.addEventListener('click', openCardsAlbum);
cardsCloseBtn?.addEventListener('click', () => cardsDialog.close());
cardDetailCloseBtn?.addEventListener('click', () => {
  cardDetailDialog.close();
  cardsDialog.showModal();
});
cardDetailSpeakBtn?.addEventListener('click', () => {
  if (selectedCardAnimal) speakText(getFactForAnimal(selectedCardAnimal));
});
resetStatsBtn?.addEventListener('click', () => {
  collection.resetProgress();
  updateStarsBadge();
  renderMasteryGrid();
  notice('Zresetowano postępy i gwiazdki.');
});

modeSelector?.querySelectorAll('.mode-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    modeSelector.querySelectorAll('.mode-pill').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-checked', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-checked', 'true');
    quizEngine.setMode(btn.dataset.mode);
    playClick();
  });
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
  setSoundEnabled(soundCheckbox.checked);
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
    if (cardDetailDialog?.open) {
      if (isBackKey(event)) {
        event.preventDefault();
        cardDetailDialog.close();
        cardsDialog.showModal();
        return;
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'Tab') {
        event.preventDefault();
        if (document.activeElement === cardDetailSpeakBtn) cardDetailCloseBtn?.focus();
        else cardDetailSpeakBtn?.focus();
        return;
      }
      if ((document.activeElement === cardDetailCloseBtn || document.activeElement === cardDetailDialog.querySelector('.close-button')) && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        cardDetailDialog.close();
        cardsDialog.showModal();
        return;
      }
      return;
    }

    if (cardsDialog?.open) {
      if (isBackKey(event)) {
        event.preventDefault();
        cardsDialog.close();
        cardsButton?.focus();
        return;
      }
      const cardItems = Array.from(cardsGridEl?.querySelectorAll('.card-item') || []);
      const closeBtn = $('cards-close-btn');
      const dialogClose = cardsDialog.querySelector('.close-button');
      const allFocusable = [...cardItems, closeBtn, dialogClose].filter(Boolean);

      if (event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey)) {
        event.preventDefault();
        const idx = allFocusable.indexOf(document.activeElement);
        if (idx >= 0 && idx < allFocusable.length - 1) {
          allFocusable[idx + 1]?.focus();
        } else {
          allFocusable[0]?.focus();
        }
        return;
      }
      if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
        event.preventDefault();
        const idx = allFocusable.indexOf(document.activeElement);
        if (idx > 0) {
          allFocusable[idx - 1]?.focus();
        } else {
          allFocusable[allFocusable.length - 1]?.focus();
        }
        return;
      }
      if (event.key === 'ArrowRight' && cardItems.includes(document.activeElement)) {
        event.preventDefault();
        const idx = cardItems.indexOf(document.activeElement);
        if (idx < cardItems.length - 1) cardItems[idx + 1]?.focus();
        return;
      }
      if (event.key === 'ArrowLeft' && cardItems.includes(document.activeElement)) {
        event.preventDefault();
        const idx = cardItems.indexOf(document.activeElement);
        if (idx > 0) cardItems[idx - 1]?.focus();
        return;
      }
      if ((document.activeElement === closeBtn || document.activeElement === dialogClose) && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        cardsDialog.close();
        cardsButton?.focus();
        return;
      }
      return;
    }

    if (settingsDialog.open) {
      if (isBackKey(event)) {
        event.preventDefault();
        settingsDialog.close();
        parentButton.focus();
        return;
      }
      const settingControls = [
        settingsDialog.querySelector('.close-button'),
        settingProfileSelect,
        settingChildNameInput,
        settingPhonicsSelect,
        settingKeyboardHint,
        settingNightMode,
        settingSceneryCheckbox,
        durationSelect,
        resetStatsBtn,
        $('settings-done')
      ].filter(Boolean);

      if (document.activeElement === settingChildNameInput) {
        if (event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey) || event.key === 'Enter') {
          event.preventDefault();
          settingPhonicsSelect?.focus();
          return;
        }
        if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
          event.preventDefault();
          settingProfileSelect?.focus();
          return;
        }
        return;
      }

      if (document.activeElement === settingProfileSelect || document.activeElement === settingPhonicsSelect) {
        const sel = document.activeElement;
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          if (sel.selectedIndex < sel.options.length - 1) sel.selectedIndex++;
          else sel.selectedIndex = 0;
          sel.dispatchEvent(new Event('change'));
          return;
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          if (sel.selectedIndex > 0) sel.selectedIndex--;
          else sel.selectedIndex = sel.options.length - 1;
          sel.dispatchEvent(new Event('change'));
          return;
        }
      }

      if ([settingKeyboardHint, settingNightMode, settingSceneryCheckbox].includes(document.activeElement) && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        document.activeElement.checked = !document.activeElement.checked;
        document.activeElement.dispatchEvent(new Event('change'));
        return;
      }

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
      if (document.activeElement === durationSelect) {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          if (durationSelect.selectedIndex < durationSelect.options.length - 1) durationSelect.selectedIndex++;
          else durationSelect.selectedIndex = 0;
          durationSelect.dispatchEvent(new Event('change'));
          return;
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          if (durationSelect.selectedIndex > 0) durationSelect.selectedIndex--;
          else durationSelect.selectedIndex = durationSelect.options.length - 1;
          durationSelect.dispatchEvent(new Event('change'));
          return;
        }
      }
      if (document.activeElement === resetStatsBtn && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        resetStatsBtn.click();
        return;
      }
      if ((document.activeElement === $('settings-done') || document.activeElement === settingsDialog.querySelector('.close-button')) && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        settingsDialog.close();
        parentButton.focus();
        return;
      }
      return;
    }

    const modePills = Array.from(modeSelector?.querySelectorAll('.mode-pill') || []);
    if (modePills.includes(document.activeElement)) {
      const idx = modePills.indexOf(document.activeElement);
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (idx % 2 === 0 && idx + 1 < modePills.length) modePills[idx + 1]?.focus();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (idx % 2 === 1) modePills[idx - 1]?.focus();
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (idx + 2 < modePills.length) modePills[idx + 2]?.focus();
        else startButton?.focus();
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (idx >= 2) modePills[idx - 2]?.focus();
        else cardsButton?.focus();
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        document.activeElement.click();
        return;
      }
    }

    if (event.key === 'p' || event.key === 'P' || event.key === 'F1') {
      event.preventDefault();
      openSettings();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      if (document.activeElement === startButton) {
        return;
      }
      if (document.activeElement === profileBtn) {
        event.preventDefault();
        profileBtn.click();
        return;
      }
      if (document.activeElement === nightBtn) {
        event.preventDefault();
        nightBtn.click();
        return;
      }
      if (['sound', 'fullscreen', 'scenery'].includes(document.activeElement?.id)) {
        event.preventDefault();
        document.activeElement.checked = !document.activeElement.checked;
        document.activeElement.dispatchEvent(new Event('change'));
        return;
      }
      if (document.activeElement === cardsButton || document.activeElement === starsBadge) {
        event.preventDefault();
        openCardsAlbum();
        return;
      }
      if (document.activeElement === parentButton) {
        event.preventDefault();
        openSettings();
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
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const activePill = modeSelector?.querySelector('.mode-pill.active') || modePills[modePills.length - 1] || modePills[0];
        activePill?.focus();
        return;
      }
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
    } else if (document.activeElement === profileBtn) {
      if (event.key === 'ArrowRight') { event.preventDefault(); nightBtn?.focus(); return; }
      if (event.key === 'ArrowLeft') { event.preventDefault(); document.querySelector('.brand')?.focus(); return; }
      if (event.key === 'ArrowDown') { event.preventDefault(); modePills[0]?.focus(); return; }
    } else if (document.activeElement === nightBtn) {
      if (event.key === 'ArrowRight') { event.preventDefault(); cardsButton?.focus(); return; }
      if (event.key === 'ArrowLeft') { event.preventDefault(); profileBtn?.focus(); return; }
      if (event.key === 'ArrowDown') { event.preventDefault(); modePills[0]?.focus(); return; }
    } else if (document.activeElement === cardsButton) {
      if (event.key === 'ArrowRight') { event.preventDefault(); parentButton.focus(); return; }
      if (event.key === 'ArrowLeft') { event.preventDefault(); nightBtn?.focus() || profileBtn?.focus() || document.querySelector('.brand')?.focus(); return; }
      if (event.key === 'ArrowDown') { event.preventDefault(); modePills[0]?.focus(); return; }
    } else if (document.activeElement === parentButton) {
      if (event.key === 'ArrowDown') { event.preventDefault(); modePills[1]?.focus() || startButton.focus(); return; }
      if (event.key === 'ArrowLeft') { event.preventDefault(); cardsButton?.focus(); return; }
    } else if (document.activeElement?.matches?.('.brand')) {
      if (event.key === 'ArrowRight') { event.preventDefault(); profileBtn?.focus() || nightBtn?.focus() || cardsButton?.focus() || parentButton.focus(); return; }
      if (event.key === 'ArrowDown') { event.preventDefault(); modePills[0]?.focus() || startButton.focus(); return; }
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
  if (quizEngine.mode === 'memory') {
    const memoryCards = Array.from(memoryBoardEl?.querySelectorAll('.memory-card') || []);
    if (event.key === 'ArrowRight') {
      const idx = memoryCards.indexOf(document.activeElement);
      const nextIdx = idx >= 0 ? (idx + 1) % memoryCards.length : 0;
      memoryCards[nextIdx]?.focus();
      return;
    }
    if (event.key === 'ArrowLeft') {
      const idx = memoryCards.indexOf(document.activeElement);
      const prevIdx = idx >= 0 ? (idx - 1 + memoryCards.length) % memoryCards.length : memoryCards.length - 1;
      memoryCards[prevIdx]?.focus();
      return;
    }
    if (event.key === 'ArrowDown') {
      const idx = memoryCards.indexOf(document.activeElement);
      const nextIdx = idx >= 0 ? (idx + 3) % memoryCards.length : 0;
      memoryCards[nextIdx]?.focus();
      return;
    }
    if (event.key === 'ArrowUp') {
      const idx = memoryCards.indexOf(document.activeElement);
      const prevIdx = idx >= 0 ? (idx - 3 + memoryCards.length) % memoryCards.length : 0;
      memoryCards[prevIdx]?.focus();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      if (memoryCards.includes(document.activeElement)) {
        document.activeElement.click();
      } else if (memoryCards.length > 0) {
        memoryCards[0]?.click();
      }
      return;
    }
    if (isAnimalInput(event)) {
      keyboardHelper.flashPress(event.key);
      const normKey = event.key.toLowerCase();
      const faceDownCard = memoryCards.find(c => c.classList.contains('back') && (c.dataset.letter === normKey || c.dataset.key === normKey));
      if (faceDownCard) {
        faceDownCard.focus();
        faceDownCard.click();
      }
      return;
    }
    return;
  }
  if (!isAnimalInput(event)) return;
  if (quizEngine.mode !== 'explore') {
    handleQuizInput(event.key);
    return;
  }
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

applyNightMode(collection.isNightMode());
keyboardHelper.setEnabled(collection.isKeyboardHint());
quizEngine.setPhonicsMode(collection.getPhonicsMode());
quizEngine.setChildName(collection.getChildName());

if (settingProfileSelect) settingProfileSelect.value = collection.getActiveProfileId();
if (settingChildNameInput) settingChildNameInput.value = collection.getChildName();
if (settingPhonicsSelect) settingPhonicsSelect.value = collection.getPhonicsMode();
if (settingKeyboardHint) settingKeyboardHint.checked = collection.isKeyboardHint();
if (settingNightMode) settingNightMode.checked = collection.isNightMode();

updateStarsBadge();
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

// Interactive On-Screen Software Keyboard & Visual Guide
// Designed for children on Android tablets, smartphones, and Android TV.
// Provides large, accessible touch targets, Polish diacritics, and interactive audio feedback.

import { normalizeAnimalKey } from './animals.js';

export const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ó', 'Ę'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ł', 'Ą', 'Ś', 'Ć'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ń', 'Ź', 'Ż']
];

export class KeyboardMapHelper {
  constructor(containerEl, { onKeyPress = null, onCollapseChange = null } = {}) {
    this.container = containerEl;
    this.keyElements = new Map();
    this.enabled = true;
    this.collapsed = false;
    this.onKeyPress = onKeyPress;
    this.onCollapseChange = onCollapseChange;

    if (this.container) {
      this.render();
    }
  }

  setOnKeyPress(cb) {
    this.onKeyPress = cb;
  }

  setOnCollapseChange(cb) {
    this.onCollapseChange = cb;
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (this.container) {
      this.container.hidden = !this.enabled || this.collapsed;
    }
  }

  setCollapsed(collapsed) {
    this.collapsed = Boolean(collapsed);
    if (this.container) {
      this.container.classList.toggle('collapsed', this.collapsed);
      this.container.hidden = this.collapsed || !this.enabled;
      this.container.setAttribute('aria-expanded', String(!this.collapsed));
    }
    this.onCollapseChange?.(this.collapsed);
  }

  toggleCollapsed() {
    this.setCollapsed(!this.collapsed);
  }

  triggerKey(key) {
    if (!this.enabled) return;
    this.flashPress(key);
    this.onKeyPress?.(key);
  }

  render() {
    if (!this.container) return;
    this.container.replaceChildren();
    this.container.className = 'keyboard-map-container software-keyboard';
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'Klawiatura ekranowa dla dzieci');
    this.container.setAttribute('aria-expanded', String(!this.collapsed));
    if (this.collapsed) {
      this.container.classList.add('collapsed');
      this.container.hidden = true;
    }

    // Letter rows
    for (const row of KEYBOARD_ROWS) {
      const rowEl = document.createElement('div');
      rowEl.className = 'kb-row';
      for (const key of row) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'kb-key';
        btn.dataset.key = key;
        btn.textContent = key;
        btn.setAttribute('aria-label', `Litera ${key}`);

        const handlePress = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.triggerKey(key);
        };

        btn.addEventListener('pointerdown', handlePress);

        rowEl.appendChild(btn);
        this.keyElements.set(key.toLowerCase(), btn);
        const norm = normalizeAnimalKey(key);
        if (norm && !this.keyElements.has(norm)) {
          this.keyElements.set(norm, btn);
        }
      }
      this.container.appendChild(rowEl);
    }

    // Action / Control row for touch devices
    const actionRow = document.createElement('div');
    actionRow.className = 'kb-row kb-action-row';

    // 1. Repeat / Hear sound button
    const repeatBtn = document.createElement('button');
    repeatBtn.type = 'button';
    repeatBtn.className = 'kb-key kb-key-action kb-key-repeat';
    repeatBtn.dataset.key = 'r';
    repeatBtn.innerHTML = '<span class="kb-icon">🔊</span><span class="kb-label">Powtórz</span>';
    repeatBtn.setAttribute('aria-label', 'Powtórz dźwięk lub nazwę zwierzaka');
    const handleRepeat = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.triggerKey('r');
    };
    repeatBtn.addEventListener('pointerdown', handleRepeat);
    repeatBtn.addEventListener('click', handleRepeat);
    this.keyElements.set('r-action', repeatBtn);

    // 2. Space / Feed button (widest center key)
    const spaceBtn = document.createElement('button');
    spaceBtn.type = 'button';
    spaceBtn.className = 'kb-key kb-key-action kb-key-space';
    spaceBtn.dataset.key = ' ';
    spaceBtn.innerHTML = '<span class="kb-icon">🥕</span><span class="kb-label">Nakarm / Spacja</span>';
    spaceBtn.setAttribute('aria-label', 'Spacja - nakarm zwierzaka lub losuj kolejne');
    const handleSpace = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.triggerKey(' ');
    };
    spaceBtn.addEventListener('pointerdown', handleSpace);
    spaceBtn.addEventListener('click', handleSpace);
    this.keyElements.set(' ', spaceBtn);

    // 3. Backspace button (for spelling mode)
    const backspaceBtn = document.createElement('button');
    backspaceBtn.type = 'button';
    backspaceBtn.className = 'kb-key kb-key-action kb-key-backspace';
    backspaceBtn.dataset.key = 'Backspace';
    backspaceBtn.innerHTML = '<span class="kb-icon">⌫</span><span class="kb-label">Usuń</span>';
    backspaceBtn.setAttribute('aria-label', 'Cofnij literę');
    const handleBackspace = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.triggerKey('Backspace');
    };
    backspaceBtn.addEventListener('pointerdown', handleBackspace);
    backspaceBtn.addEventListener('click', handleBackspace);
    this.keyElements.set('backspace', backspaceBtn);

    // 4. System keyboard toggle button (IME)
    const imeBtn = document.createElement('button');
    imeBtn.type = 'button';
    imeBtn.className = 'kb-key kb-key-action kb-key-ime';
    imeBtn.dataset.key = 'SystemIME';
    imeBtn.innerHTML = '<span class="kb-icon">⌨️</span><span class="kb-label">Systemowa</span>';
    imeBtn.setAttribute('aria-label', 'Otwórz systemową klawiaturę Androida');
    const handleIme = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.triggerKey('SystemIME');
    };
    imeBtn.addEventListener('pointerdown', handleIme);
    imeBtn.addEventListener('click', handleIme);

    // 5. Hide / Collapse button
    const collapseBtn = document.createElement('button');
    collapseBtn.type = 'button';
    collapseBtn.className = 'kb-key kb-key-action kb-key-collapse';
    collapseBtn.dataset.key = 'ToggleCollapse';
    collapseBtn.innerHTML = '<span class="kb-icon">✕</span>';
    collapseBtn.setAttribute('aria-label', 'Schowaj klawiaturę');
    const handleCollapse = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleCollapsed();
    };
    collapseBtn.addEventListener('pointerdown', handleCollapse);
    collapseBtn.addEventListener('click', handleCollapse);

    actionRow.appendChild(repeatBtn);
    actionRow.appendChild(spaceBtn);
    actionRow.appendChild(backspaceBtn);
    actionRow.appendChild(imeBtn);
    actionRow.appendChild(collapseBtn);

    this.container.appendChild(actionRow);
  }

  highlightTarget(char) {
    this.clearTarget();
    if (!this.enabled || !char) return;
    const key = char.toLowerCase();
    const el = this.keyElements.get(key) || this.keyElements.get(normalizeAnimalKey(key));
    if (el) {
      el.classList.add('target-key');
    }
  }

  clearTarget() {
    this.container?.querySelectorAll('.target-key').forEach(el => el.classList.remove('target-key'));
  }

  flashPress(char) {
    if (!this.enabled || !char) return;
    const key = char.toLowerCase();
    const el = this.keyElements.get(key) || this.keyElements.get(normalizeAnimalKey(key));
    if (el) {
      el.classList.add('pressed-key');
      setTimeout(() => el.classList.remove('pressed-key'), 220);
    }
  }
}

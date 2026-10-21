// Visual On-Screen Keyboard Map to assist children using physical keyboards on TV
// Shows key positions and pulses the target key to help orient small hands

import { normalizeAnimalKey } from './animals.js';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ó', 'Ę'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ł', 'Ą', 'Ś', 'Ć'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ń', 'Ź', 'Ż']
];

export class KeyboardMapHelper {
  constructor(containerEl) {
    this.container = containerEl;
    this.keyElements = new Map();
    this.enabled = true;
    if (this.container) {
      this.render();
    }
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (this.container) {
      this.container.hidden = !this.enabled;
    }
  }

  render() {
    if (!this.container) return;
    this.container.replaceChildren();
    this.container.className = 'keyboard-map-hint';
    this.container.setAttribute('aria-hidden', 'true');

    for (const row of KEYBOARD_ROWS) {
      const rowEl = document.createElement('div');
      rowEl.className = 'kb-row';
      for (const key of row) {
        const keyEl = document.createElement('div');
        keyEl.className = 'kb-key';
        keyEl.dataset.key = key;
        keyEl.textContent = key;
        rowEl.appendChild(keyEl);
        this.keyElements.set(key.toLowerCase(), keyEl);
        const norm = normalizeAnimalKey(key);
        if (norm && !this.keyElements.has(norm)) {
          this.keyElements.set(norm, keyEl);
        }
      }
      this.container.appendChild(rowEl);
    }
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
      setTimeout(() => el.classList.remove('pressed-key'), 250);
    }
  }
}

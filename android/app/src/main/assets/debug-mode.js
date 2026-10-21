// Imported only with ?debug=1. No settings are persisted between page loads.
export function mountDebugPanel({ snapshot, pause, finish }) {
  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = new URL('./debug-mode.css', import.meta.url).href; document.head.append(css);
  const duration = document.getElementById('duration');
  const short = new Option('10 sekund (test)', String(10 / 60));
  duration.prepend(short); duration.value = short.value;
  document.getElementById('fullscreen').checked = false;
  const panel = document.createElement('details');
  panel.className = 'debug-toolbar'; panel.open = true;
  panel.innerHTML = '<summary>Tryb testowy · 10 s na start</summary><p>Start w oknie. Pełny ekran i blokadę możesz włączyć przed startem. Zmiana czasu: Dla rodzica.</p><output aria-live="off"></output><div class="debug-actions"><button type="button" data-pause>Pauza</button><button type="button" data-night>Pokaż noc</button><a href="./debug.html">Zwierzątka</a><a href="./">Wyłącz testy</a></div>';
  document.body.append(panel);
  const pauseButton = panel.querySelector('[data-pause]');
  const nightButton = panel.querySelector('[data-night]');
  pauseButton.addEventListener('click', pause);
  nightButton.addEventListener('click', () => { if (snapshot().phase === 'playing') finish(); });
  let lastKey = '—';
  const phases = { welcome: 'start', starting: 'uruchamianie', playing: 'zabawa', paused: 'pauza', finished: 'noc' };
  function refresh() {
    const status = snapshot();
    pauseButton.disabled = status.phase !== 'playing';
    nightButton.disabled = status.phase !== 'playing';
    const label = `Stan: ${phases[status.phase]} · pozostało: ${Math.ceil(status.remaining / 1000)} s\nZwierzątko: ${status.animal} · gotowość: ${status.readiness}\nKlawisz odebrany przez stronę: ${lastKey}\nPełny ekran: ${status.fullscreen ? 'tak' : 'nie'} · Keyboard Lock: ${status.locked ? 'uzyskany' : 'nie'}\nPolski głos: ${status.voice || 'brak'}`;
    const output = panel.querySelector('output');
    if (output.textContent !== label) output.textContent = label;
  }
  const timer = setInterval(refresh, 200);
  window.addEventListener('pagehide', () => clearInterval(timer), { once: true });
  // A restored page reloads diagnostics through the same safe entry point.
  window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
  refresh();
  return {
    recordKey(event) {
      lastKey = `${event.key === ' ' ? 'Spacja' : event.key} (${event.code || 'brak code'})${event.repeat ? ' · przytrzymany' : ''}`;
      refresh();
    },
  };
}

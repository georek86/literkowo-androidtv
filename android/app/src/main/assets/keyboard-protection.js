// Request every key the browser/OS permits, including MetaLeft/MetaRight.
// Success is not proof that the OS has surrendered every system shortcut.
export async function acquireKeyboardProtection({ document, keyboard, secureContext }) {
  if (!secureContext) return { locked: false, reason: 'Blokada wymaga adresu HTTPS lub localhost.' };
  if (!keyboard?.lock) return { locked: false, reason: 'Ta przeglądarka nie udostępnia blokady klawiatury. Spróbuj Chrome lub Edge na komputerze.' };
  if (!document.fullscreenEnabled || !document.documentElement.requestFullscreen) {
    return { locked: false, reason: 'Pełny ekran jest niedostępny w tym oknie przeglądarki.' };
  }
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
  } catch {
    return { locked: false, reason: 'Przeglądarka nie pozwoliła włączyć pełnego ekranu.' };
  }
  if (!document.fullscreenElement) return { locked: false, reason: 'Pełny ekran nie został uruchomiony.' };
  try {
    // Omitting the key list requests ALL available keys. Adding an explicit
    // Meta-only list here would weaken protection for the rest of the keyboard.
    await keyboard.lock();
    if (!document.fullscreenElement) {
      keyboard.unlock();
      return { locked: false, reason: 'Pełny ekran został zamknięty podczas włączania blokady.' };
    }
    return { locked: true };
  } catch {
    return { locked: false, reason: 'Nie udało się włączyć blokady klawiatury w przeglądarce.' };
  }
}

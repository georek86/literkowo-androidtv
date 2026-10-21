# Raport wdrożenia poprawek (REBUILD-NOTES)

Stan: **Wszystkie poprawki zostały wdrożone, przetestowane i zintegrowane w gałęzi `main`**.

## 1. Rozwiązane problemy

### 1.1. Autopauza w Android WebView (`hasFocus` & `blur`) — ROZWIĄZANE
- **Problem**: Android WebView na urządzeniach dotykowych zwraca `document.hasFocus() === false` lub emituje zdarzenie `blur` przy dotknięciu ekranu lub wywołaniu klawiatury. Powodowało to natychmiastowe otwarcie okna pauzy tuż po starcie gry.
- **Rozwiązanie**: W `app.js` wprowadzono flagę `isTouchDevice` (`pointer: coarse`). Na urządzeniach dotykowych sprawdzany jest wyłącznie stan widoczności `document.hidden` (oraz zdarzenia cyklu życia `pagehide`), a fałszywe zdarzenia `blur` i brak fokusa okna nie przerywają już zabawy.

### 1.2. Zwijanie klawiatury ekranowej (test Playwright & mobile) — ROZWIĄZANE
- **Problem**: W teście Playwright oraz na urządzeniach mobilnych przycisk „Klawiatura” / „Schowaj” nie zawsze ukrywał klawiaturę, ponieważ:
  1. Kontener `.keyboard-map-container.collapsed` nie miał ustawionego `hidden`, `display: none !important;` ani `visibility: hidden !important;`, co powodowało, że automatyczne asercje widoczności Playwright (`toBeHidden()`) nie uznawały elementu za ukryty.
  2. Tekst przycisku w HTML domyślnie wskazywał „Klawiatura”, mimo że klawiatura startowała jako otwarta.
  3. Obsługa zdarzeń była ograniczona do `click`, podczas gdy emulacja dotyku w Playwright i urządzeniach mobilnych często wyzwala `pointerdown`.
- **Rozwiązanie**:
  - `setCollapsed(collapsed)` ustawia teraz `this.container.hidden = this.collapsed || !this.enabled;` oraz atrybut `aria-expanded`.
  - W CSS dodano regułę `.keyboard-map-container[hidden], .keyboard-map-container.collapsed { display: none !important; visibility: hidden !important; height: 0 !important; max-height: 0 !important; padding: 0 !important; margin: 0 !important; }`.
  - Przycisk `#btn-toggle-keyboard` dynamicznie aktualizuje etykietę: `Schowaj` (gdy klawiatura jest otwarta) oraz `Klawiatura` (gdy jest zwinięta).
  - Dodano obsługę zarówno `pointerdown`, jak i `click` z zabezpieczeniem przed podwójnym wywołaniem.

### 1.3. Przycinanie skrajnych klawiszy (Q, Ę, A, Ć) przez zaokrąglenie sceny — ROZWIĄZANE
- **Problem**: Karta sceny `.animal-stage` posiada mocno zaokrąglone narożniki (`border-radius: 180px 180px 35px 35px; overflow: hidden;`). Klawiatura o szerokości `96%` sięgała skrajnych narożników, przez co litery Q, Ę, A i Ć były lekko obcinane.
- **Rozwiązanie**:
  - Zmieniono szerokość kontenera na `width: calc(100% - 48px); max-width: 480px;`, zapewniając bezpieczny margines 24px z każdej strony od zaokrąglonych krawędzi.
  - Wprowadzono dedykowany media-query dla ekranów wąskich (`max-width: 620px`) skalujący kafelki (`height: 30px`, `width: calc(100% - 24px)`), gwarantujący brak obcinania na małych ekranach smartfonów.

### 1.4. Dedykowany dock klawiatury i widok horyzontalny (Landscape) na smartfonach — ROZWIĄZANE
- **Problem**: Na smartfonach zablokowanych w orientacji poziomej (`sensorLandscape`, np. wysokość 360–400px), karta `.animal-stage` miała `height: 84svh; overflow: hidden;` w układzie pionowym (`flex-direction: column`). Sama karta zwierzątka (litera, duża ilustracja SVG, nazwa i przycisk karmienia) wypełniała całą wysokość ekranu, wypychając klawiaturę poza dolną krawędź widoku (gdzie była w 100% obcinana). Ponadto klasa kontenera w `keyboard-map.js` była nadpisywana, a detekcja urządzeń dotykowych w WebView mogła zwracać `false`.
- **Rozwiązanie**:
  - **Dedykowany dock `#keyboard-dock`**: Przeniesiono kontener klawiatury i przycisk zwijania poza kartę `.animal-stage` jako bezpośredni brat sceny w elemencie `<main>`.
  - **Układ side-by-side w trybie poziomym (`@media (max-height: 600px)`)**: W orientacji poziomej `main` używa układu dwukolumnowego (`flex-direction: row`): po lewej stronie kompaktowa karta zwierzątka (340px szerokości, wysokość dopasowana do ekranu), a po prawej pełna klawiatura ekranowa (3 rzędy liter + rząd akcji) z dużymi, wygodnymi przyciskami dotykowymi.
  - **Pancerna detekcja ekranu dotykowego (`isTouchDevice`)**: Sprawdzanie `ontouchstart`, `navigator.maxTouchPoints > 0`, `matchMedia('(pointer: coarse)')` oraz wyrażenia regularnego User-Agenta Android/Mobile, gwarantujące poprawne rozpoznanie w Android WebView.
  - **Automatyczna widoczność klawiatury**: Wywołanie `updateKeyboardVisibility()` w funkcji `begin()`, wymuszające aktywację klawiatury ekranowej przy każdym rozpoczęciu rozgrywki na urządzeniach mobilnych.
  - **Interaktywność ekranu startowego**: Dotknięcie karty zwierzątka na ekranie powitalnym lub naciśnięcie klawisza natychmiast rozpoczyna rozgrywkę.

### 1.5. Klawiatura w systemie (wysuwalna) oraz skalowanie ekranu na telefonach — ROZWIĄZANE
- **Problem**:
  1. Aplikacja nie posiadała mostu natywnego (`JavascriptInterface`) do wywoływania systemowej klawiatury ekranowej Androida (`InputMethodManager.showSoftInput`).
  2. Element `#system-ime-input` był umieszczony poza ekranem (`top: -100px; pointer-events: none`), przez co silnik Chromium w WebView nie uznawał go za interaktywne pole i odmawiał wysunięcia klawiatury systemowej (IME / Gboard / Leanback TV).
  3. W `styles.xml` flaga `windowFullscreen=true` blokowała działanie `windowSoftInputMode="adjustResize"`, uniemożliwiając przeskalowanie widoku po wysunięciu klawiatury systemowej.
  4. Jednostki wysokości w CSS (`svh`) nie były wspierane przez część wersji Android System WebView, co powodowało odrzucanie reguł responsywności i powrót do sztywnych wysokości kart (510px).
  5. Sztywne zablokowanie orientacji `sensorLandscape` w manifeście powodowało problemy na telefonach trzymanych pionowo.
- **Rozwiązanie**:
  - **Most natywny `AndroidBridge`**: Dodano `@JavascriptInterface` w `MainActivity.java` z metodami `showSystemKeyboard()`, `hideSystemKeyboard()` i `toggleSystemKeyboard()`, współpracującymi bezpośrednio z systemowym `InputMethodManager`.
  - **Pasek klawiatury systemowej `#system-ime-bar`**: Wprowadzono czytelny przycisk `⌨️ Wysuń klawiaturę systemową` oraz interaktywne pole tekstowe `#system-ime-input`. Każde dotknięcie przycisku lub pola natychmiast wysuwa systemową klawiaturę (Gboard na smartfonach, Leanback Virtual Keyboard na Android TV).
  - **Ciągłe wprowadzanie liter**: Pole tekstowe po każdym wprowadzonym znaku natychmiast wywołuje powiązane zwierzątko i zachowuje fokus, dzięki czemu klawiatura systemowa **nie chowa się** po wpisaniu pojedynczej litery.
  - **Przycisk na ekranie startowym (`#btn-welcome-ime`)**: Umożliwia natychmiastowe rozpoczęcie zabawy z wysuniętą klawiaturą systemową jednym dotknięciem.
  - **Uniwersalne skalowanie CSS bez zależności od `svh`**: Wszystkie reguły wysokości zaktualizowano o bezpieczne `vh` i dynamiczne przeliczanie widoku, gwarantując idealne skalowanie na smartfonach i tabletach o dowolnych rozdzielczościach.
  - **Elastyczna orientacja dla smartfonów**: W `build.gradle` wersja `mobile` otrzymała placeholder `orientation: "sensor"` (automatyczne dopasowanie do pionu lub poziomu), a wersja `tv` zachowuje `orientation: "sensorLandscape"`.

---

## 2. Przebudowa i publikacja APK (Mobile & TV)

1. Wykonano synchronizację assetów: `npm run build` (`node scripts/build.mjs`).
2. Wszystkie testy jednostkowe i integracyjne zakończone sukcesem: `npm test` (**64/64 zielone**).
3. Zmiany zostały zacommitowane i wysłane do gałęzi `main`.
4. Workflow GitHub Actions `Build Android APK (Mobile & TV)` automatycznie kompiluje zaktualizowane pakiety i publikuje je na stronie wydań (GitHub Releases):
   - `literkowo.apk` / `literkowo-mobile.apk` (dla smartfonów i tabletów ze zaktualizowaną klawiaturą ekranową i poprawką dotyku),
   - `literkowo-tv.apk` (dla telewizorów z systemem Android TV).

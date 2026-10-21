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

---

## 2. Przebudowa i publikacja APK (Mobile & TV)

1. Wykonano synchronizację assetów: `npm run build` (`node scripts/build.mjs`).
2. Wszystkie testy jednostkowe i integracyjne zakończone sukcesem: `npm test` (**64/64 zielone**).
3. Zmiany zostały zacommitowane i wysłane do gałęzi `main`.
4. Workflow GitHub Actions `Build Android APK (Mobile & TV)` automatycznie kompiluje zaktualizowane pakiety i publikuje je na stronie wydań (GitHub Releases):
   - `literkowo.apk` / `literkowo-mobile.apk` (dla smartfonów i tabletów ze zaktualizowaną klawiaturą ekranową i poprawką dotyku),
   - `literkowo-tv.apk` (dla telewizorów z systemem Android TV).

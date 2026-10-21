# Do przebudowania: APK (mobile + TV)

Stan: gałąź `claude/awesome-maxwell-qihiyp` zawiera poprawkę w `app.js`
(skopiowaną do `android/app/src/main/assets/app.js`): na urządzeniach z dotykiem
gra nie pauzuje się już przy `document.hasFocus() === false` ani przy `blur`
(Android WebView zgłaszał brak fokusu i od razu otwierał modalne okno pauzy,
przez co nie dało się klikać). Bez przebudowy APK poprawka nie działa na telefonie.

Środowisko, w którym zrobiono zmianę, nie ma Android SDK, więc APK NIE zostało przebudowane.

## Kroki
1. `node scripts/build.mjs` (synchronizuje assety do `android/app/src/main/assets/`).
2. Zbuduj: `cd android && gradle assembleRelease` (JDK 17, Gradle 8.5, Android SDK)
   — lub uruchom workflow `Build Android APK (Mobile & TV)` (`workflow_dispatch`
   na tej gałęzi albo merge do `main`).
3. Wyniki: `android/app/build/outputs/apk/{mobile,tv}/release/`.
   Podmień `literkowo-tv.apk` w katalogu głównym (jest stare) i dodaj APK mobilne.
4. Przetestuj na telefonie: start gry, dotykanie klawiszy ekranowych, przycisk
   „Klawiatura", wstrzymanie/wznowienie.

## Znane drobiazgi (niezbadane)
- Przycisk „Klawiatura" nie zwinął klawiatury w teście Playwright (może artefakt).
- Skrajne klawisze (Q, Ę) lekko ucięte przez zaokrąglony kształt sceny.

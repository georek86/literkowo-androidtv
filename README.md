# Literkowo

<img width="1331" height="696" alt="image" src="https://github.com/user-attachments/assets/89dc271d-cc52-4653-9b9a-b8bc39dc1d1a" />

Interaktywna zabawa rodzica lub opiekuna z dzieckiem: wspólne oglądanie zwierzątek, nazywanie ich i odkrywanie reakcji na dotyk, mysz oraz klawiaturę. Do korzystania wyłącznie razem z dorosłym i pod jego stałym nadzorem.

**[Otwórz aplikację](https://jkobus.github.io/literkowo/)** · [Galeria zwierząt](https://jkobus.github.io/literkowo/debug.html)

## Dzieci i ekrany

WHO nie zaleca siedzącego czasu przed ekranem dzieciom poniżej 2. roku życia. Dla dzieci w wieku 2–4 lat zaleca nie więcej niż godzinę dziennie — im mniej, tym lepiej. [Zalecenia WHO](https://www.who.int/news-room/detail/24-04-2019-to-grow-up-healthy-children-need-to-sit-less-and-play-more).

Wspólna, interaktywna zabawa przy ekranie nadal jest czasem ekranowym. Aplikacja nie zastępuje zabawy bez ekranu ani kontaktu z opiekunem. Nie jest narzędziem terapeutycznym i nie ma potwierdzonej skuteczności edukacyjnej. Ustawienia timera nie są zaleceniem zdrowotnym.

## Jak korzystać i tryby zabawy

Aplikacja zawiera 100 zwierząt z polskimi nazwami, lektorem i ciekawostkami, w pełni obsługiwana za pomocą fizycznej klawiatury lub pilota na Android TV.

### 4 tryby zabawy (wybór na ekranie startowym):
1. **Odkrywanie (swobodne poznawanie)**:
   - Dziecko wciska dowolną literkę na klawiaturze i odkrywa zwierzątko na tę literę wraz z poprawną wymową polskiego lektora. Spacja, cyfry i dotyk losują z całego albumu.
2. **Zgadnij literkę (nauka ze słuchu i wzroku)**:
   - Lektor pyta np. *„Gdzie jest literka M?”*. Dziecko szuka odpowiedniego klawisza na fizycznej klawiaturze (lub wybiera kafelek na ekranie). Za poprawną odpowiedź zdobywa gwiazdkę!
3. **Pierwsza litera**:
   - Na ekranie pojawia się zwierzątko (np. Pies). Lektor pyta: *„Na jaką literę zaczyna się pies?”*. Dziecko naciska klawisz `P`.
4. **Napisz słowo (literowanie)**:
   - Na ekranie pojawia się zwierzątko o krótkiej nazwie (np. KOT, PIES, LIS, FOKA, SOWA) oraz puste klocki `[ _ ] [ _ ] [ _ ]`.
   - Dziecko wstukuje litery po kolei. Po ułożeniu całego słowa rozbrzmiewa radosna fanfara!

### System nagród i kolekcja kart:
- **Gwiazdki**: Za poprawne odpowiedzi w quizach dziecko otrzymuje gwiazdki.
- **Album 100 kart ze zwierzątkami**: Zdobywanie gwiazdek odblokowuje kolejne karty w albumie. Każda karta zawiera ilustrację, nazwę oraz ciekawostkę przyrodniczą czytaną przez lektora.
- **Efekty dźwiękowe (Web Audio)**: Radosne akordy sukcesu, dzwoneczki gwiazdek, fanfary i łagodne dźwięki motywujące (działające 100% offline, bez dodatkowych plików audio).
- **Postępy w nauce liter (Dla rodzica)**: W panelu rodzica dostępna jest siatka całego polskiego alfabetu pokazująca, które litery dziecko opanowało już bezbłędnie (zielone), a które jeszcze ćwiczy (żółte).

## Obsługa na Android TV (klawiatura fizyczna)

Aplikacja jest przystosowana do działania na telewizorach i dekoderach z **Android TV** sterowanych za pomocą fizycznej klawiatury (USB lub Bluetooth) oraz pilota:

- **Uruchomienie i nawigacja po menu**:
  - `Enter` / `Spacja` na ekranie startowym natychmiast rozpoczyna zabawę (przycisk *Zaczynamy* ma domyślne skupienie).
  - Strzałki (`Góra`, `Dół`, `Lewo`, `Prawo`) oraz `Tab`: wygodna nawigacja przestrzenna (D-Pad) po przełącznikach opcji i menu rodzica.
  - Wyraźne, kontrastowe podświetlenie aktywnego elementu dostosowane do oglądania z kanapy (10-foot UI).
- **Podczas zabawy**:
  - Naciśnięcie dowolnej litery (`A-Z`, polskie znaki z AltGr lub bez) pokazuje zwierzątko na tę literę. Klawiatura może mieć układ polski lub angielski (np. klawisz `C` obsługuje też `Ć`, `L` — `Ł`, `S` — `Ś`, `Z` — `Ż`/`Ź`).
  - Spacja, cyfry i pozostałe klawisze losują zwierzątko z całego albumu.
  - Klawisze multimedialne i głośności pilota/klawiatury są ignorowane — regulacja głośności nie zmienia zwierzątka.
  - Klawisz `Escape` lub przycisk `Back` pilota wstrzymuje zabawę (pauza).
  - Przytrzymanie klawisza `P` przez 2 sekundy (lub naciśnięcie z przycisku rodzica) wywołuje pauzę z widocznym okręgiem postępu.
- **W menu pauzy**:
  - Strzałki `Góra`/`Dół` oraz `Tab` przełączają między przyciskami *Wznów zabawę* a *Zakończ zabawę*.
  - `Enter` lub `Spacja` aktywuje zaznaczony przycisk, a `Escape` wznawia zabawę.
  - Przypadkowe stukanie w litery przez dziecko jest ignorowane i nie zamyka pauzy.
- **Zakończenie czasu („Zwierzątka poszły spać”)**:
  - Dorosły może wrócić do początku naciskając `Escape` lub przytrzymując `Enter`/`Spację` przez 2 sekundy.
- **Pełny ekran bez blokady sprzętowej**:
  - Na Android TV przeglądarki nie obsługują desktopowego API blokady klawiatury (`navigator.keyboard.lock`). Aplikacja automatycznie dostosowuje opcję do czystego pełnego ekranu i nie blokuje startu gry.
  - Aplikację można otworzyć w przeglądarce dla Android TV (np. TV Bro, JioPages, Chrome) lub zainstalować jako PWA na ekranie głównym.

## Odpowiedzialność

Aplikacja jest udostępniana „tak jak jest”, bez gwarancji poprawności, dostępności, przydatności do określonego celu ani korzyści zdrowotnych, rozwojowych lub edukacyjnych. Decyzję o udostępnieniu jej dziecku, sposobie i czasie korzystania podejmuje rodzic lub opiekun.

W najszerszym zakresie dopuszczalnym przez obowiązujące prawo autorzy i współtwórcy wyłączają odpowiedzialność za szkody wynikające z korzystania z aplikacji lub niemożności jej użycia, w tym szkody dotyczące zdrowia, rozwoju dziecka, sprzętu lub danych. Zastrzeżenie to nie wyłącza ani nie ogranicza odpowiedzialności, której nie można wyłączyć lub ograniczyć na mocy prawa.

## Lokalnie i publikacja

Wymagany Node.js 20 lub nowszy, bez instalowania zależności:

```sh
npm start
```

Otwórz http://localhost:4173. Galeria: `/debug.html`; tryb testowy: `/?debug=1`.

```sh
npm test
npm run build
```

Gotowa strona znajduje się w `dist/`. Push do `main` uruchamia testy i automatycznie publikuje ją na GitHub Pages.

Licencja: [MIT](LICENSE).

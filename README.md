# Literkowo

Interaktywna zabawa rodzica lub opiekuna z dzieckiem: wspólne oglądanie zwierzątek, nazywanie ich i odkrywanie reakcji na dotyk, mysz oraz klawiaturę. Do korzystania wyłącznie razem z dorosłym i pod jego stałym nadzorem.

**[Otwórz aplikację](https://jkobus.github.io/literkowo/)** · [Galeria zwierząt](https://jkobus.github.io/literkowo/debug.html)

## Dzieci i ekrany

WHO nie zaleca siedzącego czasu przed ekranem dzieciom poniżej 2. roku życia. Dla dzieci w wieku 2–4 lat zaleca nie więcej niż godzinę dziennie — im mniej, tym lepiej. [Zalecenia WHO](https://www.who.int/news-room/detail/24-04-2019-to-grow-up-healthy-children-need-to-sit-less-and-play-more).

Wspólna, interaktywna zabawa przy ekranie nadal jest czasem ekranowym. Aplikacja nie zastępuje zabawy bez ekranu ani kontaktu z opiekunem. Nie jest narzędziem terapeutycznym i nie ma potwierdzonej skuteczności edukacyjnej. Ustawienia timera nie są zaleceniem zdrowotnym.

## Jak korzystać

Album zawiera 88 zwierząt pod 22 klawiszami. Większość liter ma kilka zwierzątek; pod E, I i U jest po jednym. Polskie litery działają też bez AltGr.

- Zabawa zaczyna się od losowego zwierzątka. Dotyk, kliknięcie i Spacja losują z całego albumu; litera — spośród pasujących nazw. Tasowane pule zapewniają różnorodność i unikają bezpośrednich powtórzeń, gdy jest kilka zwierząt do wyboru. Poruszaj kursorem lub palcem, aby skierować wzrok zwierzątka.
- Głos, scenerię i czas zabawy ustawia dorosły. Przytrzymanie „Dla rodzica” przez 2 sekundy otwiera pauzę; „Zakończ zabawę” wraca na początek.
- Pełny ekran i blokada klawiatury zależą od przeglądarki i systemu. Nie gwarantują zablokowania wszystkich skrótów, gestów ani przycisków urządzenia.

Bez reklam, kont i analityki. Polski lektor zależy od głosów dostępnych na urządzeniu; niektóre wymagają internetu i mogą przesyłać nazwy zwierząt dostawcy syntezy mowy.

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

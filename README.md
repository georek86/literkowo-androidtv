# Literkowo

Spokojny album zwierząt w JavaScript do krótkiej, wspólnej zabawy z opiekunem. Bez zależności, reklam, kont i analityki.

Gra jest w całości przeglądarkowa: użytkownik otwiera link HTTPS na Ubuntu lub Windows. Nie wymaga instalowania aplikacji, rozszerzeń ani lokalnych programów do blokowania klawiatury. Node.js służy wyłącznie do lokalnego podglądu i przygotowania plików do publikacji.

## Publikacja jako strona statyczna

```sh
npm run build
```

Katalog `dist/` zawiera wyłącznie HTML, CSS i JavaScript gry. Można umieścić go na Cloudflare Pages lub innym hostingu statycznym z HTTPS. Serwer Node nie jest potrzebny na hostingu ani na laptopie gracza.

Konfiguracja Cloudflare Pages: framework **None**, build command **npm run build**, build output directory **dist**. Alternatywnie można przesłać gotowy katalog `dist/`. Ścieżki są względne: gra działa zarówno w głównym katalogu domeny, jak i pod adresem projektu, np. `/literkowo/` na GitHub Pages. [Dokumentacja hostowania statycznego HTML](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/).

## GitHub Pages

Adres po publikacji: **https://jkobus.github.io/literkowo/** (galeria: `debug.html`, tryb testowy: `?debug=1`).

Workflow `.github/workflows/pages.yml` po każdym pushu do `main` uruchamia testy, buduje `dist/` i publikuje wyłącznie ten katalog. Można go też uruchomić ręcznie w zakładce Actions. W repozytorium ustaw **Settings → Pages → Source → GitHub Actions**; nie potrzeba osobnej gałęzi `gh-pages` ani serwera Node na hostingu.

GitHub Pages dla prywatnych repozytoriów wymaga odpowiedniego planu GitHub (np. Pro). Na planie Free Pages obsługuje repozytoria publiczne. Sama witryna Pages jest publiczna, chyba że używany plan udostępnia i ma skonfigurowaną kontrolę dostępu. [Dokumentacja GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Uruchomienie

Wymagany Node.js 20 lub nowszy:

```sh
npm start
```

Otwórz **http://localhost:4173**. Port można zmienić przez `PORT=4174 npm start`. Serwer nasłuchuje tylko na lokalnym komputerze. Nie potrzeba `npm install` ani procesu budowania. Pliki można również udostępnić dowolnym serwerem statycznym (w katalogu głównym witryny). Uruchamianie bezpośrednio przez `file://` nie jest obsługiwane, ponieważ aplikacja używa modułów JavaScript.

## Zabawa

- Przed startem rodzic wybiera głos lektora (domyślnie wyłączony) oraz „Pełny ekran i blokada” (domyślnie włączone przy sterowaniu myszą; przy podstawowym sterowaniu dotykiem domyślnie wyłączone, aby można było zacząć bez obsługi Keyboard Lock). Przy wybranej blokadzie odmowa pełnego ekranu lub Keyboard Lock zatrzymuje uruchomienie gry. Wyłączenie opcji pozwala świadomie grać w oknie bez blokady skrótów.
- 75 zwierzątek dostępnych pod 22 zwykłymi klawiszami: A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, R, S, T, U, W, Z. Nie potrzeba AltGr: Ć → C, Ł → L, Ś → S, Ź/Ż → Z. Normalizacja obsługuje również Ą → A, Ę → E, Ń → N i Ó → O. Polskie litery działają jako aliasy tej samej grupy. Nazwa i duża litera na ekranie zachowują poprawną pisownię, np. klawisz Z pokazuje także „Ż ż” i „żółw”.
- Kolejne zaakceptowane naciśnięcia K pokazują: kot → kaczka → krowa → królik → koza → koń → krab → koala → kangur → kogut → krokodyl → kameleon → konik morski → kura → kot. P: pies → panda → papuga → pingwin → pszczoła → paw. S: sowa → słoń → sarna → ślimak → szop → surykatka. Z: zebra → źrebak → żaba → żółw → żyrafa. L: lis → lew → łoś → leniwiec → łabędź. C: cykada → chomik → ćma. Każda litera pamięta ostatnio pokazane zwierzę, również po użyciu innej litery lub pauzie. Nowa sesja zaczyna te sekwencje od początku.
- Spacja, Enter, strzałki, cyfry i nieprzypisane litery przechodzą do następnego zwierzęcia w stałej kolejności albumu, od aktualnie pokazanego. Po ostatnim następuje pierwsze. Wyświetlana litera zawsze odpowiada nazwie zwierzęcia. Same modyfikatory (Shift, Ctrl, Alt, Meta, Fn) oraz skróty z nimi nie przewijają albumu. Esc zachowuje funkcję wyjścia/pauzy.
- Nowa prezentacja może zacząć się najwcześniej po 2,2 sekundy. Przytrzymanie klawisza jest ignorowane. Naciśnięcia podczas wypowiedzi są pomijane, nie kolejkowane. Po wypowiedzi zostaje co najmniej pół sekundy ciszy.
- Kółko pod nazwą pokazuje rzeczywistą gotowość: jest przygaszone podczas wypowiedzi, następnie wypełnia się przez pozostałą przerwę. Pełne oznacza, że kolejny dotyk lub klawisz zostanie przyjęty. Bez lektora wypełnia się przez całą przerwę. Odrzucone naciśnięcia nie resetują kółka i nie pomijają zwierząt. Przy ograniczeniu animacji kółko zmienia się bez płynnego wypełniania.
- **Zmienna sceneria** jest domyślnie włączona. Każde zwierzątko ma dopasowane, nieruchome otoczenie: np. sarna — las, lew — sawanna, panda — bambusy, delfin — ocean, koala — Australia. Łącznie 15 scenerii, w tym pustynia dla wielbłąda. Przełącznik na ekranie startowym i w ustawieniach rodzica wyłącza scenerię i przywraca jednolite tło; nie zmienia tempa ani kolejności zwierząt. Wybór obowiązuje do przeładowania strony.
- Ilustracje mają wspólny wektorowy styl, wyraźniejsze kontury, mocniejsze naturalne kolory i czytelniejsze oczy. Nowe zwierzątka: borsuk, niedźwiedź polarny, koala, kangur, szop, wilk, wydra, leniwiec, nietoperz, paw, łabędź, dzięcioł, kogut, krokodyl, wąż, kameleon, konik morski, meduza, wielbłąd, surykatka i kura. Kura ma mały grzebień, krótki ogon i zaokrąglony tułów; kogut — duży grzebień i długie pióra ogona. Tygrys jest dostępny pod T.
- Dotknięcie lub kliknięcie obszaru zabawy przechodzi do następnego zwierzątka w albumie, tak jak Spacja. Zmieniają się razem zwierzątko, litera, nazwa i dopasowana sceneria; lektor wypowiada nazwę przy włączonym głosie. Dotyk, mysz i klawiatura używają wspólnej przerwy 2,2 sekundy i czekają na koniec wypowiedzi. Ruch palca lub przytrzymanie nie przewijają albumu, a dodatkowe palce są ignorowane. Przycisk rodzica pozostaje poza obszarem przewijania.
- Kursor lub przesuwany palec delikatnie porusza tęczówką i źrenicą wewnątrz nieruchomej, jasnej części oka. Dotyczy to wszystkich zwierząt, w tym bocznych sylwetek kozy i owcy; oba oczy korzystają ze wspólnego kierunku liczonego względem środka ich pary (lub jednego oka w profilu). Ruch aktualizuje się raz na klatkę bez opóźniającego przejścia CSS. Gra śledzi kursor w całym oknie, także nad górnym paskiem i poza sceną. W galerii ostatnio oglądane zwierzątko podąża wzrokiem również po przesunięciu kursora poza ilustrację; po najechaniu na inną kartę sterowanie przechodzi na nią. Podgląd w galerii reaguje tak samo. Po oderwaniu palca wzrok wraca do środka. Na tabletach można zacząć zabawę w oknie bez klawiatury; ekran startowy informuje o tym ustawieniu.
- Przytrzymanie przycisku rodzica przez 2 sekundy zatrzymuje zabawę. Obramowanie stopniowo obrysowuje przycisk, pokazując czas przytrzymania. Wcześniejsze puszczenie lub wyjście kursorem/palcem poza przycisk zeruje postęp. Przy ograniczeniu animacji obramowanie przyrasta w czterech krokach. Wyjście z pełnego ekranu, zmiana karty lub utrata fokusu również wstrzymuje zabawę. Wznowienie wymaga kliknięcia rodzica.
- Panel rodzica pozwala ustawić zakończenie po 2, 3 lub 5 minutach aktywnej zabawy (domyślnie 3). Dyskretny licznik pokazuje pozostały czas. Pauza nie zużywa pozostałego czasu.
- „Zakończ zabawę” w oknie pauzy rodzica wraca od razu na stronę główną: zatrzymuje lektora i zegar, zwalnia blokadę klawiatury oraz wychodzi z pełnego ekranu. Nowa zabawa wymaga ponownego kliknięcia „Zaczynamy”.
- Po upływie czasu zabawy ekran przez 3 sekundy przechodzi w nocną scenerię z księżycem, nieruchomymi gwiazdami i śpiącym kotem: „Zwierzątka poszły spać”. Lektor milknie, klawisze nie budzą zwierzątek i nie uruchamiają kolejnej sesji. Pełny ekran i dostępna blokada pozostają włączone. Powrót do początku wymaga przytrzymania przycisku rodzica przez 2 sekundy; wtedy blokada zostaje zwolniona. Przy ograniczeniu animacji noc pojawia się bez przejścia.

## Głos i offline

Lektor używa `SpeechSynthesis` oraz polskiego głosu dostępnego w systemie/przeglądarce, z preferencją dla głosu lokalnego. Aplikacja informuje, jeśli nie ma polskiego głosu; nie zastępuje go głosem obcojęzycznym. Nie zawiera nagrań MP3. Barwa głosu zależy od urządzenia. Niektóre głosy przeglądarkowe wymagają internetu i mogą przesyłać nazwy zwierząt do dostawcy syntezy.

Strona, ilustracje i interakcje działają bez internetu, gdy lokalny serwer jest uruchomiony. Nie pobiera fontów ani grafik z zewnętrznych serwerów. Głos działa offline tylko wtedy, gdy udostępnia go system lokalnie. Preferencja ograniczenia animacji (`prefers-reduced-motion`) jest respektowana.

## Ograniczenia blokady

Pełny ekran oraz `Keyboard Lock` są włączane po kliknięciu rodzica. Dostępność i zakres blokady zależą od przeglądarki, systemu, bezpiecznego kontekstu (HTTPS lub localhost) i ustawień przeglądarki. Gra wywołuje `navigator.keyboard.lock()` bez listy klawiszy — to prośba o **wszystkie** dostępne klawisze, w tym MetaLeft/MetaRight (Windows/Super), o ile system je udostępnia. Jawna lista zawierająca tylko Windows zawęziłaby zakres przechwytywania.

Przy zaznaczonej opcji „Pełny ekran i blokada” gra nie przechodzi automatycznie do zabawy bez ochrony, gdy któraś funkcja zawiedzie. Przyczyna pozostaje na ekranie startowym albo w oknie pauzy przy nieudanym wznowieniu. Rodzic może ponowić próbę lub wyłączyć opcję na ekranie startowym, aby bawić się bez blokady. Przechwycone zdarzenia `keydown`, `keypress` i `keyup` są zatrzymywane także podczas uruchamiania i pauzy; nie wpływa to na zdarzenia, których system nie przekazuje stronie.

Sukces `lock()` nie potwierdza zablokowania klawisza Windows/Super ani wszystkich skrótów systemowych. F11 nie zastępuje pełnego ekranu włączanego przez przycisk gry. Chrome zachowuje awaryjne wyjście przez przytrzymanie Esc przez około 2 sekundy.

Strona **nie gwarantuje** zablokowania wszystkich skrótów systemu, gestów touchpada, przycisku zasilania ani uśpienia. Jeśli pełna blokada jest konieczna, potrzebna jest konfiguracja systemowego trybu kiosku. [Dokumentacja Keyboard Lock](https://developer.chrome.com/docs/capabilities/web-apis/keyboard-lock).

WHO nie zaleca czasu ekranowego dla rocznych dzieci. Gra nie ma potwierdzonej skuteczności edukacyjnej, a ustawienia timera nie są zaleceniem medycznym. [Zalecenia WHO](https://www.who.int/news-room/detail/24-04-2019-to-grow-up-healthy-children-need-to-sit-less-and-play-more).

## Sprawdzenie

```sh
npm test
```

Testy obejmują ograniczanie tempa, zgodność wskaźnika z gotowością (w tym długie wypowiedzi), brak kolejki, powtórzenia klawiszy, pauzę, polskie mapowanie, cykle pod literami, przechodzenie przez cały album, modyfikatory oraz powodzenie i odmowy włączania blokady, przypisanie scenerii wszystkim zwierzętom oraz wyłączanie tła bez zmiany ilustracji zwierzęcia. Pełny ekran, rzeczywiste skróty systemowe i brzmienie lektora wymagają sprawdzenia na docelowym laptopie.

## Podgląd i tryb testowy

- **http://localhost:4173/debug.html** — galeria wszystkich zwierząt z bieżącej bazy gry. Filtry nazwy i litery, kolejność pod klawiszem, powiększenie, odsłuch tym samym głosem i w tym samym tempie co w grze, przełącznik scenerii, cztery jednolite tła oraz skala szarości do wzrokowej oceny czytelności. Zmiana tła nie zmienia gry. Brak polskiego głosu wyłącza odsłuch.
- **http://localhost:4173/?debug=1** — gra z panelem diagnostycznym. Domyślnie 10 sekund i start w oknie; przed startem można włączyć pełny ekran i blokadę, a w ustawieniach rodzica wybrać zwykły czas. Panel pokazuje stan, czas, gotowość, zwierzątko, ostatni klawisz dostarczony stronie, głos i stan blokady. Przyciski „Pauza” i „Pokaż noc” używają tych samych funkcji co normalna gra. W pauzie korzystaj z okna wznowienia/zakończenia.
- **Wyłącz testy** wraca do `/`, przywracając domyślne 3 minuty i zaznaczoną blokadę. Testy nie zapisują ustawień. Nie ma linków do debugowania w widoku dziecka. Oba adresy działają również na hostingu statycznym — zastąp `http://localhost:4173` adresem witryny. To publiczne narzędzia testowe, bez danych prywatnych ani uprawnień administratora.
- Podgląd klawisza pokazuje tylko zdarzenia przekazane przez system do strony. Brak reakcji na Windows/Super nie dowodzi zablokowania klawisza.

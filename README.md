# Literkowo & Literkowo TV

<img width="1331" height="696" alt="Literkowo & Literkowo TV" src="https://github.com/user-attachments/assets/89dc271d-cc52-4653-9b9a-b8bc39dc1d1a" />

**Literkowo** to bezpłatna, otwartoźródłowa i w 100% bezpieczna aplikacja edukacyjna dla dzieci w wieku przedszkolnym i wczesnoszkolnym (2–6 lat). Aplikacja dostępna jest w dwóch dedykowanych wersjach instalacyjnych Androida:

1. 📱 **Literkowo na zwykłego Androida (Smartfony i Tablety)**:
   - Z wbudowaną, dotykową **klawiaturą software'ową (ekranową)** z dużymi polskimi literami (`A–Z` oraz `Ą`, `Ć`, `Ę`, `Ł`, `Ń`, `Ó`, `Ś`, `Ź`, `Ż`).
   - Przycisk karmienia zwierzaka 🥕, powtórzenia dźwięku 🔊 oraz cofania litery ⌫.
   - Możliwość zwinięcia klawiatury w dowolnym momencie oraz opcjonalne wsparcie dla systemowej klawiatury Androida (np. Gboard).
2. 📺 **Literkowo TV (Telewizory i Dekodery Android TV / Google TV)**:
   - Zoptymalizowana pod interfejs **10-foot UI** (duże kafelki czytelne z odległości 3 metrów).
   - Sterowanie za pomocą **fizycznej klawiatury komputerowej** (USB/Bluetooth) lub pilota z D-padem.
   - Blokada przypadkowych klawiszy systemowych i bezpieczna bramka rodzicielska (`P`).

Do korzystania wyłącznie wspólnie z dorosłym i pod jego stałym nadzorem.

### 📥 Pobierz gotowe pakiety APK:
* 📱 **[Pobierz APK dla smartfonów i tabletów (`literkowo.apk`)](https://github.com/georek86/literkowo-androidtv/releases/download/v1.0.0/literkowo.apk)**
* 📺 **[Pobierz APK dla Android TV (`literkowo-tv.apk`)](https://github.com/georek86/literkowo-androidtv/releases/download/v1.0.0/literkowo-tv.apk)**
* 🌟 **[Wszystkie wydania na GitHub Releases](https://github.com/georek86/literkowo-androidtv/releases)**
* 🌐 **[Wersja przeglądarkowa online](https://georek86.github.io/literkowo-androidtv/)** · [Przegląd zwierzątek](https://georek86.github.io/literkowo-androidtv/debug.html)

---

## Geneza i odniesienie do projektu pierwotnego

Niniejszy projekt powstał jako rozwinięcie i fork wspaniałej, minimalistycznej aplikacji otwartoźródłowej **[Literkowo](https://github.com/jkobus/literkowo)** autorstwa **[Jakuba Kobusa](https://github.com/jkobus)** (udostępnionej na licencji MIT).

Oryginalne *Literkowo* powstało jako prosta zabawa rodzica z dzieckiem przy komputerze lub tablecie, polegająca na swobodnym odkrywaniu zwierząt i reakcji na klawiaturę.

### Co zmieniono i dodano w Literkowo TV & Mobile:

W niniejszym forku projekt został gruntownie rozbudowany o wieloplatformowy ekosystem edukacyjny:

| Funkcjonalność | Projekt pierwotny (Literkowo) | Literkowo (Smartfony i Tablety) | Literkowo TV (Telewizory i Dekodery) |
| :--- | :--- | :--- | :--- |
| **Pakiety APK** | Brak (tylko Web) | **`literkowo.apk`** | **`literkowo-tv.apk`** |
| **Klawiatura** | Wyłącznie fizyczna / losowy dotyk | **Dotykowa klawiatura software'owa** + IME | **Fizyczna klawiatura USB/BT** + pilot D-pad |
| **Liczba trybów zabawy** | 1 tryb (swobodne odkrywanie) | **8 trybów dydaktycznych** | **8 trybów dydaktycznych** |
| **Interfejs użytkownika** | Standardowy webowy | Dotykowy mobile/tablet z autoukrywaniem | **10-foot UI**, podświetlenia fokusowe |
| **Metodyka czytania** | Tylko nazwa zwierzątka | **Głoskowanie vs alfabet** + **metoda sylabowa** | **Głoskowanie vs alfabet** + **metoda sylabowa** |
| **Karmienie zwierzątek** | Brak | **Przycisk 🥕 Nakarm**, serduszka, chrupanie | **Klawisz Spacja**, serduszka, chrupanie |
| **Odgłosy zwierząt** | Brak | **Synteza Web Audio (CC0)** | **Synteza Web Audio (CC0)** |
| **System nagród i album** | Brak | **100 kart, ciekawostki, gwiazdki** | **100 kart, ciekawostki, gwiazdki** |
| **Wsparcie rodzeństwa** | Jeden wspólny stan | **Wieloprofilowość (Gracz 1 i 2)** | **Wieloprofilowość (Gracz 1 i 2)** |
| **Personalizacja** | Brak | **Wpisywanie imienia dziecka do zadań** | **Wpisywanie imienia dziecka do zadań** |
| **Ochrona wzroku** | Jasny motyw | **Tryb wieczorny (Warm Night Mode)** | **Tryb wieczorny (Warm Night Mode)** |
| **Statystyki dla rodzica** | Brak | **Siatka opanowania liter alfabetu** | **Siatka opanowania liter alfabetu** |
| **Licencja** | MIT | **100% MIT / CC0**, brak mikropłatności | **100% MIT / CC0**, brak mikropłatności |

---

## 📱 Dotykowa klawiatura software'owa (ekranowa)

W wersji na telefony i tablety aplikacja wyposażona jest w dedykowaną, dotykową **klawiaturę software'ową**:
- **Duże, kolorowe kafelki**: zaprojektowane specjalnie dla małych dłoni dziecka, z zachowaniem polskich znaków diakrytycznych (`Ą`, `Ć`, `Ę`, `Ł`, `Ń`, `Ó`, `Ś`, `Ź`, `Ż`).
- **Przycisk 🥕 Nakarm / Spacja**: największy centralny przycisk dolnego paska wyzwalający rzucanie przysmaków i losowanie kolejnego zwierzaka.
- **Przycisk 🔊 Powtórz**: natychmiast odtwarza wymowę lektora lub odgłos zwierzaka.
- **Przycisk ⌫ Usuń**: pozwala dziecku cofnąć błędną literę podczas nauki pisania słów.
- **Wsparcie dla klawiatury systemowej (⌨️ Klawiatura systemowa / wysuwalna)**: możliwość wysunięcia pełnej klawiatury systemowej Androida (np. Gboard z dyktowaniem głosowym na telefonie lub ekranowej klawiatury Leanback IME na Android TV) za pomocą przycisku lub pola wprowadzania. Klawiatura pozostaje wysunięta podczas wpisywania kolejnych liter.
- **Przycisk ✕ Schowaj / Pokaż**: umożliwia ukrycie klawiatury jednym dotknięciem, aby podziwiać ilustrację zwierzątka na pełnym ekranie.
- **Odpowiedź haptyczna i dźwiękowa**: każde dotknięcie klawisza wyzwala przyjemny dźwięk bąbelka (`playKeyClick()`) oraz delikatną wibrację telefonu.

---

## 8 Trybów zabawy i nauki

Wybór trybu jest dostępny bezpośrednio na ekranie startowym (z pełną nawigacją dotykową lub strzałkami D-pad):

1. 🐾 **Poznawanie (Swobodne odkrywanie)**:
   - Dziecko wybiera dowolną literę na klawiaturze. Na ekranie pojawia się dopasowane zwierzątko, lektor wymawia jego nazwę, a z głośników rozbrzmiewa autentyczny odgłos zwierzątka.
   - Wciśnięcie przycisku **🥕 Nakarm** rzuca zwierzakowi jego ulubiony przysmak!
2. 🎯 **Zgadnij literkę**:
   - Lektor pyta ze słuchu: *„Gdzie jest literka M?”* (lub *„Gdzie jest głoska M?”*). Dziecko odnajduje klawisz na klawiaturze programowej lub wskazuje kafelek.
3. 🔤 **Pierwsza litera**:
   - Na ekranie pojawia się zwierzątko. Zadaniem dziecka jest odgadnięcie, na jaką literę zaczyna się jego nazwa (np. *Pies* $\rightarrow$ `P`).
4. ✏️ **Napisz słowo (Literowanie)**:
   - Dziecko układa krótkie słowa (np. K-O-T, P-I-E-S) litera po literze w klockach na ekranie.
   - **Personalizacja imienia**: Jeśli w ustawieniach wpisano imię dziecka (np. *KASIA*), co kilka rund pojawia się runda specjalna z układaniem własnego imienia!
5. 🎴 **Pary (Memory)**:
   - Gra pamięciowa: dziecko odkrywa pary (litera + pasujące zwierzątko) dotykiem lub wciskając odpowiednią literę.
6. 🕵️ **Cienie („Kto się schował?”)**:
   - Zwierzątko ukrywa się w scenerii jako tajemniczy czarny kontur. Po naciśnięciu właściwej litery następuje rozbłysk, zwierzątko ujawnia barwy i wita się z dzieckiem.
7. 🧩 **Sylaby (Metoda symultaniczno-sekwencyjna)**:
   - Wczesna nauka czytania metodą sylabową (np. `[ŻA]` + `[BA]` = ŻABA, `[KO]` + `[TEK]` = KOTEK). Duże, pulsujące kafelki sylab ułatwiają płynne składanie słów.
8. 👂 **Dźwięki (Zagadki słuchowe)**:
   - Z głośników dobiega odgłos zwierzaka (miauczenie, szczekanie, rżenie, rechot, ryk lwa itp.). Dziecko odgaduje, kto to był. Klawiszem `R` lub przyciskiem 🔊 można powtórzyć dźwięk w dowolnym momencie.

---

## 🥕 Interaktywne karmienie zwierzątka

Pod ilustracją każdego zwierzaka znajduje się przycisk **Nakarm**, wyzwalany również klawiszem **Spacja** lub dotknięciem przysmaku na klawiaturze:
- 🐟 **Rybka** dla kota, foki, delfina, pingwina, niedźwiedzia.
- 🦴 **Kostka** dla psa, wilka, lisa.
- 🥕 **Marchewka** dla królika, zająca, chomika.
- 🍌 **Banan** dla małpki.
- 🥜 **Orzeszek** dla wiewiórki, myszy.
- 🍀 **Koniczynka i trawka** dla krowy, konia, owcy, sarny, żubra.
- 🌸 **Kwiatek** dla pszczoły, osy, motyla.
- 🪰 **Mucha** dla żaby, kameleona.
- 🌾 **Ziarno** dla kury, kaczki, gęsi, papugi.
- 🍎 **Jabłuszko** dla pozostałych zwierząt.

Przysmak szybuje do pyszczka, rozlega się chrupiący dźwięk (`playMunch()`), wylatują serduszka ❤️, a zwierzak radośnie dziękuje lektorem.

---

## 📱 Instalacja na smartfonach i tabletach (zwykły Android)

1. Pobierz plik [**`literkowo.apk`**](https://github.com/georek86/literkowo-androidtv/releases/download/v1.0.0/literkowo.apk) w przeglądarce telefonu lub tabletu.
2. Otwórz pobrany plik z powiadomień lub folderu *Pobrane*.
3. Potwierdź instalację (jeśli system zapyta, zezwól na instalację z tego źródła).
4. Ikona **Literkowo** pojawi się na ekranie głównym urządzenia.

---

## 📺 Instalacja na Android TV

1. Pobierz plik [**`literkowo-tv.apk`**](https://github.com/georek86/literkowo-androidtv/releases/download/v1.0.0/literkowo-tv.apk).
2. **Przez pendrive USB**:
   - Skopiuj plik na pendrive i podłącz do portu USB w telewizorze lub dekoderze.
   - Za pomocą dowolnego menedżera plików dla Android TV (np. *X-plore*, *AnExplorer*) zainstaluj plik.
3. **Bezprzewodowo**:
   - Prześlij plik z telefonu lub komputera na telewizor za pomocą darmowej aplikacji *Send Files to TV*.
4. Kafelka **Literkowo TV** pojawi się na ekranie głównym telewizora w rzędzie aplikacji.

---

## ⌨️ Sterowanie na TV (klawiatura fizyczna i pilot)

- **Dowolna litera (`A–Z`, polskie znaki)**: odkrywa zwierzątko, odpowiada na quizy lub obraca karty.
- **Spacja**: w trybie swobodnym karmi zwierzaka; w menu uruchamia zaznaczony przycisk.
- **Strzałki (D-Pad)**: płynna nawigacja przestrzenna po opcjach, kartach memory i ustawieniach.
- **Enter**: zatwierdzenie wyboru / start.
- **Esc / Back na pilocie**: wstrzymanie zabawy (pauza) lub powrót z dialogu.
- **Klawisz `P` (lub przytrzymanie przez 2 sekundy)**: bramka rodzicielska chroniąca przed przypadkowym wyjściem.
- **Klawisze głośności**: regulują dźwięk telewizora bez wpływu na grę.

---

## Dzieci i ekrany (WHO)

WHO nie zaleca siedzącego czasu przed ekranem dzieciom poniżej 2. roku życia. Dla dzieci w wieku 2–4 lat zaleca nie więcej niż godzinę dziennie — im mniej, tym lepiej. [Zalecenia WHO ↗](https://www.who.int/news-room/detail/24-04-2019-to-grow-up-healthy-children-need-to-sit-less-and-play-more).

Wspólna, interaktywna zabawa przy ekranie nadal jest czasem ekranowym. Aplikacja nie zastępuje zabawy bez ekranu ani kontaktu z opiekunem. Wbudowany w panel rodzica timer (2, 3 lub 5 minut) pomaga łagodnie zakończyć sesję komunikatem *„Zwierzątka poszły spać”*.

---

## Uruchomienie lokalne i testy

Projekt wykorzystuje czyste standardy webowe (Vanilla ES Modules, SVG, Web Audio, Web Speech API) bez zewnętrznych frameworków i zależności:

Wymagany Node.js 20+:

```sh
# Uruchomienie lokalnego serwera deweloperskiego
npm start

# Uruchomienie pełnego zestawu 64 testów jednostkowych i integracyjnych
npm test

# Budowanie wersji statycznej dist/ oraz synchronizacja assetów aplikacji Android
npm run build
```

---

## Licencja

Projekt jest w 100% wolnym i otwartym oprogramowaniem na licencji **[MIT](LICENSE)**.

Wszystkie ilustracje wektorowe SVG, dźwięki proceduralne Web Audio oraz treści edukacyjne są w domenie publicznej / CC0 lub na licencji MIT, gwarantując pełną czystość prawną, brak mikropłatności i poszanowanie prywatności dziecka.

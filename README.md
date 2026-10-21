# Literkowo TV

<img width="1331" height="696" alt="Literkowo TV" src="https://github.com/user-attachments/assets/89dc271d-cc52-4653-9b9a-b8bc39dc1d1a" />

**Literkowo TV** to edukacyjna, bezpłatna aplikacja dla dzieci w wieku przedszkolnym i wczesnoszkolnym (2–6 lat), zoptymalizowana specjalnie dla telewizorów i dekoderów z systemem **Android TV** sterowanych za pomocą **fizycznej klawiatury komputerowej** (USB/Bluetooth) lub pilota.

Do korzystania wyłącznie wspólnie z dorosłym i pod jego stałym nadzorem.

* **[Pobierz gotowy pakiet APK dla Android TV](https://github.com/georek86/literkowo-androidtv/releases/download/v1.0.0-tv/literkowo-tv.apk)**
* **[Strona wydań (GitHub Releases)](https://github.com/georek86/literkowo-androidtv/releases/tag/v1.0.0-tv)**
* **[Wersja przeglądarkowa online](https://georek86.github.io/literkowo-androidtv/)** · [Przegląd zwierzątek](https://georek86.github.io/literkowo-androidtv/debug.html)

---

## Geneza i odniesienie do projektu pierwotnego

Niniejszy projekt powstał jako rozwinięcie i fork wspaniałej, minimalistycznej aplikacji otwartoźródłowej **[Literkowo](https://github.com/jkobus/literkowo)** autorstwa **[Jakuba Kobusa](https://github.com/jkobus)** (udostępnionej na licencji MIT).

Oryginalne *Literkowo* powstało jako prosta zabawa rodzica z dzieckiem przy komputerze lub tablecie, polegająca na swobodnym odkrywaniu zwierząt i reakcji na klawiaturę.

### Co zmieniono i dodano w Literkowo TV:

W wersji **Literkowo TV** projekt został gruntownie rozbudowany o dedykowany ekosystem edukacyjny dla telewizorów:

| Funkcjonalność | Projekt pierwotny (Literkowo) | Literkowo TV |
| :--- | :--- | :--- |
| **Platforma** | Wyłącznie przeglądarka internetowa | **Aplikacja Android TV (.APK)** + PWA + Web |
| **Liczba trybów zabawy** | 1 tryb (swobodne odkrywanie) | **8 trybów dydaktycznych** (sylaby, dźwięki, cienie, memory...) |
| **Sterowanie na TV** | Standardowa obsługa klawiszy A-Z | **Pełny 10-foot UI, D-pad pilota, fizyczna klawiatura, podświetlenie focusu** |
| **Metodyka czytania** | Tylko nazwa zwierzątka | **Głoskowanie (fonemy) vs alfabet** oraz **metoda sylabowa** |
| **Interakcja ze zwierzęciem** | Animacja powitania | **Karmienie zwierzątek przysmakami (Spacja)**, serduszka, reakcje |
| **Odgłosy zwierząt** | Brak | **Proceduralna synteza odgłosów natury (Web Audio CC0)** |
| **Nauka i motywacja** | Brak punktacji i celów | **Album 100 kart, gwiazdki, ciekawostki przyrodnicze lektora** |
| **Wsparcie rodzeństwa** | Jeden wspólny stan | **Wieloprofilowość (Gracz 1 i 2)** z osobnymi gwiazdkami i kartami |
| **Personalizacja** | Brak | **Wpisywanie imienia dziecka** z dedykowaną rundą literowania |
| **Wizualna pomoc klawiatury** | Brak | **Ekranowy schemat klawiszy** z pulsującym celem i błyskiem wciśnięcia |
| **Ochrona wzroku** | Jasny motyw dzienny | **Tryb nocny / wieczorny (Warm Mode)** redukujący niebieskie światło |
| **Diagnostyka postępów** | Brak | **Panel rodzica ze statystykami opanowania liter polskiego alfabetu** |
| **Czystość licencyjna** | MIT | **100% MIT / CC0**, zero reklam, zero śledzenia, 100% offline |

---

## 8 Trybów zabawy i nauki

Wybór trybu jest dostępny bezpośrednio na ekranie startowym (z pełną nawigacją strzałkami D-pad):

1. 🐾 **Poznawanie (Swobodne odkrywanie)**:
   - Dziecko naciska dowolny klawisz na fizycznej klawiaturze. Na ekranie pojawia się dopasowane zwierzątko, lektor wymawia jego nazwę, a z głośników rozbrzmiewa autentyczny odgłos zwierzątka.
   - Wciśnięcie **Spacji** rzuca zwierzakowi jego ulubiony przysmak!
2. 🎯 **Zgadnij literkę**:
   - Lektor pyta ze słuchu: *„Gdzie jest literka M?”* (lub *„Gdzie jest głoska M?”*). Dziecko odnajduje klawisz na klawiaturze fizycznej lub wskazuje kafelek pilotem.
3. 🔤 **Pierwsza litera**:
   - Na ekranie pojawia się zwierzątko. Zadaniem dziecka jest odgadnięcie, na jaką literę zaczyna się jego nazwa (np. *Pies* $\rightarrow$ `P`).
4. ✏️ **Napisz słowo (Literowanie)**:
   - Dziecko układa krótkie słowa (np. K-O-T, P-I-E-S) litera po literze w klockach na ekranie.
   - **Personalizacja imienia**: Jeśli w ustawieniach wpisano imię dziecka (np. *KASIA*), co kilka rund pojawia się runda specjalna z układaniem własnego imienia!
5. 🎴 **Pary (Memory)**:
   - Gra pamięciowa dopasowana do telewizora: dziecko odkrywa pary (litera + pasujące zwierzątko) za pomocą strzałek pilota lub wciskając odpowiednią literę na klawiaturze.
6. 🕵️ **Cienie („Kto się schował?”)**:
   - Zwierzątko ukrywa się w scenerii jako tajemniczy czarny kontur. Po naciśnięciu właściwej litery następuje rozbłysk, zwierzątko ujawnia barwy i wita się z dzieckiem.
7. 🧩 **Sylaby (Metoda symultaniczno-sekwencyjna)**:
   - Wczesna nauka czytania metodą sylabową (np. `[ŻA]` + `[BA]` = ŻABA, `[KO]` + `[TEK]` = KOTEK). Duże, pulsujące kafelki sylab ułatwiają płynne składanie słów.
8. 👂 **Dźwięki (Zagadki słuchowe)**:
   - Z głośników telewizora dobiega odgłos zwierzaka (miauczenie, szczekanie, rżenie, rechot, ryk lwa itp.). Dziecko odgaduje, kto to był. Klawiszem `R` można powtórzyć dźwięk w dowolnym momencie.

---

## 🥕 Interaktywne karmienie zwierzątka

Pod ilustracją każdego zwierzaka znajduje się przycisk **Nakarm**, wyzwalany również największym klawiszem klawiatury — **Spacją**:
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

## 📺 Instalacja na Android TV

### Pobranie gotowego pliku APK:
Pobierz najnowszą wersję: [**`literkowo-tv.apk` (GitHub Releases)**](https://github.com/georek86/literkowo-androidtv/releases/download/v1.0.0-tv/literkowo-tv.apk).

### Jak zainstalować:
1. **Przez pendrive USB**:
   - Skopiuj pobrany plik `literkowo-tv.apk` na pendrive i podłącz do portu USB w dekoderze/telewizorze.
   - Za pomocą dowolnego menedżera plików dla Android TV (np. *X-plore*, *AnExplorer*) zainstaluj plik.
2. **Bezprzewodowo (np. aplikacja Send Files to TV)**:
   - Prześlij plik z telefonu lub komputera na telewizor i uruchom instalator.

Po instalacji kafelka **Literkowo** pojawi się w głównym menu Android TV. Aplikacja pamięta stan pełnego ekranu i nie wymaga dotyku ani myszy.

---

## ⌨️ Sterowanie fizyczną klawiaturą i pilotem

Aplikacja została zaprojektowana według standardu **10-foot UI** (czytelność z odległości 3 metrów od kanapy):
- **Dowolna litera (`A–Z`, polskie znaki)**: odkrywa zwierzątko, odpowiada na quizy lub obraca karty.
- **Spacja**: w trybie swobodnym karmi zwierzaka; w menu uruchamia zaznaczony przycisk.
- **Strzałki (D-Pad)**: płynna nawigacja przestrzenna po opcjach, kartach memory i ustawieniach.
- **Enter**: zatwierdzenie wyboru / start.
- **Esc / Back na pilocie**: wstrzymanie zabawy (pauza) lub wyjście z dialogu.
- **Klawisz `P` (lub przytrzymanie przez 2 sekundy)**: bramka rodzicielska chroniąca przed przypadkowym wyjściem przez dziecko.
- **Klawisze głośności**: są całkowicie bezpieczne (regulują dźwięk bez przełączania zwierzątek).

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

# Budowanie wersji statycznej dist/ oraz synchronizacja assetów Android TV
npm run build
```

---

## Licencja

Projekt jest w 100% wolnym i otwartym oprogramowaniem na licencji **[MIT](LICENSE)**.

Wszystkie ilustracje wektorowe SVG, dźwięki proceduralne Web Audio oraz treści edukacyjne są w domenie publicznej / CC0 lub na licencji MIT, gwarantując pełną czystość prawną, brak mikropłatności i poszanowanie prywatności dziecka.

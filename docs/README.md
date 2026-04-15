# Dokumentacja Techniczna Systemu - MoodBook

Poniższa dokumentacja stanowi niezależne rozwinięcie założeń technicznych i strukturalnych projektu uwzględniające Architekturę, Bezpieczeństwo oraz Instrukcje instalacyjne. 

---

## 🏗️ 1. Architektura Systemu

Platforma oparta jest o architekturę klient-serwer z modelem Sztucznej Inteligencji implementowanym poprzez API i bazą relacyjną. Zastosowano modularne podejście separacji obaw (Separation of Concerns).

### Wykorzystane Technologie i Biblioteki:
- **Frontend** (Aplikacja Mobilna):
  - **React Native & Expo:** Budowa natywnych interfejsów (iOS/Android) ze współdzielonego kodu JS.
  - **React Navigation:** Obsługa routingu, nawigacji dolnej (Tab) i modalnej (Stack).
  - **react-native-chart-kit:** Wizualizacja złożonych danych parametrycznych za pomocą wykresów liniowych i słupkowych.
  - **lucide-react-native:** Spójny system ikon.

- **Backend** (API Serwer):
  - **Node.js + Express.js:** Obsługa zapytań HTTP na portach w lekkiej architekturze REST.
  - **PostgreSQL (`pg`):** Relacyjne magazynowanie historii zdarzeń medycznych, wyników AI i parametrów logowania.
  - **openai (npm):** Narzedzie komunikacyjne w ustandaryzowanym formacie do odpytywania modelu zgodnego w pełni z formatem OpenAPI Chat Completions.

### Stack AI (Rozwiązania Lokalne / LLM)
- **Model BieliK:** Główny model odpowiedzialny za językową analizę semantyczną wypowiedzi. Prowadzi ewaluację nastroju polskiego pacjenta, a także szacuje procentowe wartości czterech najważniejszych metryk (Szczęście, Smutek, Stres, Złość).
- **Modele towarzyszące:** `gemma4:small`, `gemma4:large` jako awaryjne zasoby w silniku kinowym. Backend kieruje ustandaryzowany HTTP Prompting do serwera (na określonym hoście /v1) by zagwarantować zgodność z ochroną danych.
- **Pętle Wiedzy (Feedback Loop):** Opracowany innowacyjny obieg porad w kodzie: Model przy tworzeniu dziennika rzuca 3 porady. Na drugi dzień w aplikacji frontendowej te porady pytają pacjenta `Czy udało Ci się zrealizować...`. Wynik przekazywany jest modelowi, by uniknąć zjawiska "Zacinającej się płyty" przy następnej predykcji.

### Schemat Przepływu Danych (Data Flow):
1. **[ZBIERANIE]** Użytkownik wysyła formularz parametryczny (sen, nawodnienie) i opisowy dzienny.
2. **[ODBIÓR HTTP]** Backend zapisuje zrzut historyczny w tablicy `Notes` (surowe dane).
3. **[PRZESYŁ & REDAKCJA]** Zredagowany skrócony log wstrzykiwany jest do promptu dla LLM (`sk-...` auth key).
4. **[EWOLUCJA]** Odpowiedź JSON jest parsowana, walidowana w `AiService` i kategoryzowana. Do bazy wstrzykiwane są klastry emocjonalne i encje `AiAdvice`.
5. **[ODCZYT]** Podczas renderowania Dashboardu pobierane są surowe rekordy i agregowane do jednego, wygładzonego krzywą Beziera obrazu. Wpisy dzienne przechodzą filtrowanie względem konkretnych dat z uwzględnieniem Timezone.

---

## 🚀 2. Instrukcja Uruchomienia / Setup

System podzielony jest na dwa główne węzły. Przed uruchomieniem wymaganym pre-rekwizytem jest posiadanie zainstalowanego `Node.js` (min. wersja 18+) oraz bazy `PostgreSQL`.

### Konfiguracja Bazy Danych
1. Zainstaluj klasyczny serwer deweloperski Postgres (często na porcie `5432`).
2. Załóż bazę/użytkownika. Domyślnie skrypt wskazuje w logice bazy `db_config.js`: db:`testovabaza`, user:`postgres`, pass:`postgres`.
3. Baza zmigruje i wygeneruje wszystkie tabele samoczynnie (`db_init.js`) przy pierwszym starcie backendu.

### Odpalenie Backendu
1. Otwórz ścieżkę terminala z folderem backendowym:
   ```bash
   cd backend
   ```
2. Zainstaluj niezbędne biblioteki pakietowe `npm`:
   ```bash
   npm install
   ```
3. Uruchom serwer developerski `nodemon`:
   ```bash
   npm run dev
   ```
   > Konsola powinna zwrócić komunikat: `Server running on port 3000`.

### Odpalenie Frontendu (Aplikacji)
1. Upewnij się, że posiadasz moduł Expo / aplikację Expo Go na smartfonie.
2. Wejdź w ścieżkę projektu aplikacji:
   ```bash
   cd ModeBook
   ```
3. Pobierz Node Modules:
   ```bash
   npm install
   ```
4. Przeprowadź hot-start Expo:
   ```bash
   npx expo start
   ```
   > Zeskanuj wynikowy QR code urządzeniem mobilnym, bądź wciśnij klawisz `a` (Android Emulator) / `i` (iOS Simulator).

---

## 🛡️ 3. Bezpieczeństwo i Walidacja

W trosce o dane użytkownika, system wdrożył wielowarstwowe zasady ochrony:

1. **Prepared Statements (Zapobieganie SQL Injection):** Cały backend w pełni rezygnuje z manualnej konstrukcji stringów zapytań bazy. Każda komunikacja wykorzystuje sparametryzowane flagi (`$1, $2, $3` w środowisku paczki `pg`), przez co intencjonalne ataki z rzutowaniem średników i klauzul `DROP` stają się nieszkodliwe.
2. **Redakcja PII (Anonimizacja względem API):** Baza danych jest jedynym "Source of Truth" tożsamości użytkowników. Prompty AI łączące parametry behawioralne pacjenta nie przekazują do modelu językowego jego imienia, nazwiska czy kluczy deszyfrujących, podnosząc stopień odizolowania chmurowego.
3. **Walidacje Typów i Bounded Checks:** System unika wyrzuceń "NaN" (Not a Number). Wszystkie suwaki wejściowe (Ilość Wody, Sen) poddane są cichym limitom np. max limit po suwaku dla snu do 12h zabezpiecza model LLM przed testowaniem wstrzyknięcia gigantycznych nieprawidłowych liczb. Wszystkie zwracane przez model LLM wartości są ograniczane ułamkami do progów od 0 do 100 bez wyjątków.
4. **Wykrywanie anomalii i łapanie potknięć AI (Robust JSON Formatting):** Przewidziano w `AiController.js` sytuację gdzie mały model zerwie formatowanie JSON i odpowie wprost. Moduł wykorzystuje systemy try/catch a także domyślne fallback-responses. W razie błędu serwera AI, pacjent otrzymuje awaryjne wstrzyknięcie poprawnych typów z losową bezpieczną adnotacją.

---

## 🧪 4. Testy i Walidacja Jakości Logiki

Aplikacja zyskała odporność poprzez ręczne testy integracyjne na styku głównych technologii:

- **Unit Testing parsingu Odpowiedzi AI:** Scenariusze obejmujące radzenie sobie narzędzia parsującego z błędnymi zagnieżdżeniami apostrofów LLM, ucinaniem klamr czy zwrócenia przez model "Nie powiem ci, jestem modelem AI...".
- **Integracja Bazodanowa:** Automatyczne odpytywanie zapisanego tygodniowego cache na poleceniach typu "Wyczyść wszystko - przetestuj puste okno" (puste ekrany braku wpisów - empty states handling).
- **Test Feedback-Loopa:** Upewnienie się że złączenie (JOINs logic) pomiędzy `AiAdvice` oraz dziennym wpisem skutkuje wygenerowaniem nowych wyników. Wpisywanie tych samych danych potwierdziło, że po udzieleniu odpowiedzi model dynamicznie obniża wagi podobnych tematyk w celu redukcji wtórności!
- **Data i Strefy Czasowe:** Konfiguracja rzutująca na testowy plik `testConfig.js` pozwala zespołowi wygenerować środowiska z zasymulowanymi interwałami czasowymi z przyszłości z obejściem realnych limitacji czasowych i obciążeń. 

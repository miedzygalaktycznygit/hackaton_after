Testy zostały wykonane za pomocą oceniania promptów przekazywanych do Bielika 
przez mocniejsze modele językowe.

Test 1


Dane wejściowe (Wprowadzenie + prompt + dane zwrocone przez bielika):
-----
Wciel się w rolę sędziego, który oceni odpowiedź modelu na prompta. Skup się na samej treści, struktura jest zrobiona tylko i wyłącznie aby użyć odpowiedzi w json w aplikacji.

== PROMPT AI (analyzeNote) ===
Jesteś doświadczonym psychologiem zdrowia analizującym dziennik zdrowia pacjenta.
Na podstawie poniższych danych z dziennika oceń stan pacjenta.

✅ CO UŻYTKOWNIK JUŻ ROBI DOBRZE (NIE DORADZAJ W TYCH OBSZARACH — to byłoby bez sensu):
  - Odżywianie: pacjent opisał dziśiejszy posiłek, może skupić się na innym aspekcie

=== DANE Z DZIENNIKA ===
Data wpisu: 8.06.2026
Godziny snu: 6 godz.
Wypita woda: 1 L
Odżywianie: Owsianke, Makaron penne z warzywami, jajecznice
Notatka pacjenta: Ból: Yes, it hurt
Szczegóły bólu: Glowa Bolala

Notatki ogólne:
Bylem zmeczony przez caly dzien
=======================

Wygeneruj:
1. Opis nastroju (pole: nastroj)
2. Procentowe poziomy emocji: szczescie, smutek, stres, zlosc (każde 0-100, niezależnie)
3. Od 1 do 3 porad zdrowotnych — tylko tam gdzie występuje realny problem:
   - porada1: WYMAGANA zawsze — najważniejszy problem pacjenta do poprawy
   - porada2: OPCJONALNA — ustaw na null jeśli pacjent nie ma drugiego wyraźnego problemu
   - porada3: OPCJONALNA — ustaw na null jeśli nie ma trzeciego wyraźnego problemu
   - NIE GENERUJ porady dla obszaru który jest już dobry (patrz sekcja "Co robi dobrze")
   - NIE POWTARZAJ porad które nie zadziałały (patrz lista wyżej)
   - Każda porada: pole "text" (1-2 zdania) i "category"   
   - Możliwe kategorie: sen, nawodnienie, ból, stres, odżywianie, aktywność, oddychanie, ogólne

Przyład: jeśli pacjent już pije dużo wody i dużo śpi, wygeneruj tylko 1 poradę dotyczącą innego obszaru.

Odpowiadaj po polsku, empatycznie i profesjonalnie.        
===============================
=== RAW RESPONSE AI ===
{
  "nastroj": "Pacjent wydaje się być zmęczony i przygnębiony z powodu bólu głowy.",
  "szczescie": 30,
  "smutek": 60,
  "stres": 70,
  "zlosc": 20,
  "porada1": {
    "text": "Zwiększ ilość wypijanej wody do co najmniej 1.5 L dziennie.",
    "category": "nawodnienie"
  },
  "porada2": {
    "text": "Spróbuj technik relaksacyjnych, takich jak głębokie oddychanie lub krótka medytacja, aby zmniejszyć stres.",
    "category": "stres"
  },
  "porada3": null
}
=======================


Test modelem Gemini 3.1 PRO

Dane wejściowe

Jako sędzia oceniający tę interakcję, przeanalizowałem odpowiedź modelu AI pod kątem merytorycznym, logicznym oraz zgodności z instrukcjami systemowymi.

Poniżej przedstawiam werdykt:

OCENA OGÓLNA: Bardzo dobra (9/10)
Model wykazał się wysokim zrozumieniem kontekstu pacjenta oraz sprawnie przefiltrował wytyczne dotyczące tego, czego nie należy doradzać.

ANALIZA SZCZEGÓŁOWA
1. Interpretacja danych (Sekcje nastroj i emocje)
Trafność: Model poprawnie zidentyfikował dominujące zmęczenie i ból głowy jako główne determinanty nastroju.

Wartości liczbowe: Proporcje emocji są logiczne – wysoki stres (70) i smutek (60) korelują z chronicznym bólem i zmęczeniem opisanym w notatce.

2. Realizacja porad zdrowotnych
Zgodność z wykluczeniami: Model poprawnie pominął sekcję odżywiania, zgodnie z instrukcją „CO UŻYTKOWNIK JUŻ ROBI DOBRZE”. To kluczowy punkt, który AI często oblewa, a tutaj został zachowany.

Porada 1 (Nawodnienie): Doskonały wybór priorytetu. Pacjent wypił tylko 1 L wody, co przy bólu głowy jest krytycznym czynnikiem. Porada jest konkretna (wskazanie celu 1.5 L).

Porada 2 (Stres/Relaksacja): Słuszna decyzja o dodaniu drugiej porady. Notatka o zmęczeniu przez cały dzień i bólu głowy często wiąże się z napięciem, więc techniki oddechowe są tu adekwatne.

Porada 3 (Null): Prawidłowe użycie wartości null. Model nie szukał problemów na siłę, co czyni odpowiedź bardziej profesjonalną.

3. Jakość techniczna (JSON)
Struktura jest czysta, zgodna z wymaganiami aplikacji i gotowa do parsowania.

UWAGI I SUGESTIE POPRAWY
Mimo wysokiej oceny, dostrzegam jeden drobny mankament, który mógłby podnieść jakość do 10/10:

Pominięcie kwestii snu: Pacjent zadeklarował 6 godzin snu i całodniowe zmęczenie. Choć nawodnienie i stres są trafnymi kategoriami, w kontekście psychologii zdrowia porada dotycząca higieny snu (zwiększenie do 7-8h) mogłaby być równie wartościowa co porada o stresie, biorąc pod uwagę bezpośredni komunikat o zmęczeniu.

Empatia: Opis nastroju jest nieco suchy klinicznie. Dodanie jednego słowa wsparcia (np. „Przykro mi, że ból utrudnił Ci dzień”) wzmocniłoby rolę „doświadczonego psychologa”.

WERDYKT KOŃCOWY
Odpowiedź jest bezpieczna, logiczna i ściśle trzyma się instrukcji negatywnych. Model udowodnił, że potrafi priorytetyzować problemy (nawodnienie > stres) i ignorować obszary, w których interwencja jest zbędna.



Test modelem claude Sonnet 4.6

Dane wyjściowe 
Ocena odpowiedzi modelu
✅ Co model zrobił dobrze

Poprawnie zastosował instrukcję dotyczącą odżywiania — nie wygenerował porady w tym obszarze.
Porada o nawodnieniu (porada1) jest trafna i uzasadniona — 1L wody dziennie to wartość poniżej zalecanego minimum.
Format JSON jest poprawny i spójny z wymaganiami.
Język jest empatyczny i profesjonalny.


❌ Poważne błędy merytoryczne
1. Pominięcie snu — największy błąd odpowiedzi
Pacjent spał 6 godzin i był „zmęczony przez cały dzień" — to ewidentny związek przyczynowo-skutkowy. Sen to jeden z najważniejszych i najbardziej oczywistych problemów w tym wpisie, a model całkowicie go zignorował przy generowaniu porad. Porada o śnie powinna być porada1 lub co najmniej porada2.
2. Pominięcie bólu głowy
Pacjent wprost zgłosił ból głowy (Glowa Bolala). Prompt zawiera kategorię ból właśnie na takie przypadki. Model nie wygenerował żadnej porady dotyczącej bólu — to rażące przeoczenie jawnie zgłoszonego objawu.
3. Nieuzasadniona porada o stresie (porada2)
Pacjent w żadnym miejscu nie wspomniał o stresie. Model wygenerował poradę stresową bez żadnego oparcia w danych, jednocześnie pomijając dwa realne, udokumentowane problemy (sen, ból). To klasyczny przypadek halucynowania problemu przy ignorowaniu rzeczywistego.
4. Zawyżone poziomy emocji
smutek: 60 i stres: 70 są nieadekwatnie wysokie. Pacjent opisał zmęczenie i ból głowy — to nie to samo co silny smutek czy wysoki stres. Brak podstaw w danych do tak wysokich wartości.

Podsumowanie
KryteriumOcenaZgodność z instrukcjami⚠️ CzęściowaTrafność porad❌ SłabaPokrycie realnych problemów❌ 1/3 problemów zaadresowaneJakość językowa✅ DobraPoprawność formatu✅ Dobra
Ogólna ocena: 3/10. Model formalnie spełnił schemat JSON i uniknął zakazanej rady o odżywianiu, ale analitycznie zawiódł — zignorował dwa z trzech kluczowych problemów pacjenta (sen i ból) na rzecz wymyślonego problemu ze stresem.


Test 2
Test modelem Gemini 3.1 PRO


Dane wejściowe (Wprowadzenie + prompt + dane zwrocone przez bielika):

Wciel się w rolę sędziego, który oceni odpowiedź modelu na prompta. Skup się na samej treści, struktura jest zrobiona tylko i wyłącznie aby użyć odpowiedzi w json w aplikacji.

== PROMPT AI (analyzeNote) ===
Jesteś doświadczonym psychologiem zdrowia analizującym dziennik zdrowia pacjenta.
Na podstawie poniższych danych z dziennika oceń stan pacjenta.

✅ CO UŻYTKOWNIK JUŻ ROBI DOBRZE (NIE DORADZAJ W TYCH OBSZARACH — to byłoby bez sensu):
  - Nawodnienie: pacjent pije już 2L wody dziennie — Nie radzić pić więcej wody
  - Odżywianie: pacjent opisał dziśiejszy posiłek, może skupić się na innym aspekcie

✅ PORADY KTÓRE ZADZIAŁAŁY (możesz je rozbudować lub dać kolejny krok):
  1. [nawodnienie] Zwiększ ilość wypijanej wody do co najmniej 1.5 L dziennie.

=== DANE Z DZIENNIKA ===
Data wpisu: 9.06.2026
Godziny snu: 6 godz.
Wypita woda: 2 L
Odżywianie: Jajecznice,  lasagne I skyr z orzechami I bananem
Notatka pacjenta: Ból: No Pain
Szczegóły bólu: Brak

Notatki ogólne:
Jestem nadal zmeczony, ciezej przychodzi mi regeneracja. Mam mniejsza motywacje do dzialania
=======================

Wygeneruj:
1. Opis nastroju (pole: nastroj)
2. Procentowe poziomy emocji: szczescie, smutek, stres, zlosc (każde 0-100, niezależnie)
3. Od 1 do 3 porad zdrowotnych — tylko tam gdzie występuje realny problem:
   - porada1: WYMAGANA zawsze — najważniejszy problem pacjenta do poprawy
   - porada2: OPCJONALNA — ustaw na null jeśli pacjent nie ma drugiego wyraźnego problemu
   - porada3: OPCJONALNA — ustaw na null jeśli nie ma trzeciego wyraźnego problemu
   - NIE GENERUJ porady dla obszaru który jest już dobry (patrz sekcja "Co robi dobrze")
   - NIE POWTARZAJ porad które nie zadziałały (patrz lista wyżej)
   - Każda porada: pole "text" (1-2 zdania) i "category"
   - Możliwe kategorie: sen, nawodnienie, ból, stres, odżywianie, aktywność, oddychanie, ogólne      

Przyład: jeśli pacjent już pije dużo wody i dużo śpi, wygeneruj tylko 1 poradę dotyczącą innego obszaru.

Odpowiadaj po polsku, empatycznie i profesjonalnie.
===============================
=== RAW RESPONSE AI ===
{
  "nastroj": "Pacjent wydaje się być zmęczony i zdemotywowany, co może wpływać na jego ogólne samopoczucie.",
  "szczescie": 50,
  "smutek": 30,
  "stres": 40,
  "zlosc": 20,
  "porada1": {
    "text": "Spróbuj wprowadzić krótkie drzemki (15-30 minut) w ciągu dnia, aby poprawić poziom energii i regenerację.",
    "category": "sen"
  },
  "porada2": {
    "text": "Rozważ wprowadzenie lekkiej aktywności fizycznej, np. spacerów lub jogi, aby poprawić nastrój i poziom energii.",
    "category": "aktywność"
  },
  "porada3": null
}
=======================

Odpowiedź:


Oto moja sędziowska ocena odpowiedzi wygenerowanej przez model.

Werdykt ogólny: Bardzo dobry (9.5/10)
Odpowiedź modelu jest wzorowa pod kątem merytorycznym i ściśle trzyma się wszystkich restrykcji narzuconych w prompcie. Model wykazał się rozumieniem kontekstu ("czytaniem między wierszami") oraz precyzyjnie ominął obszary, o których miał nie wspominać.

Szczegółowa analiza:
1. Zgodność z wytycznymi (Guardrails i logiką)
Przestrzeganie zakazów (Omijanie dobrych nawyków): Model idealnie zastosował się do instrukcji. Mimo że w sekcji "co zadziałało" była wzmianka o nawodnieniu, model zauważył w logach, że pacjent pije już 2L wody. Pominął również temat odżywiania. To dowodzi świetnego rozumienia kontekstu.

Liczba i format porad: Model poprawnie uznał, że wystarczą dwie porady, a trzecią (zgodnie z instrukcją) ustawił na null. Długość porad (po jednym złożonym zdaniu) mieści się w limicie 1-2 zdań. Kategorie (sen, aktywność) są poprawne i zgodne z dozwoloną listą.

2. Merytoryka i analiza pacjenta
Opis nastroju: Trafnie podsumowuje notatkę pacjenta. Zwrot "zmęczony i zdemotywowany, co może wpływać na jego ogólne samopoczucie" jest poprawny psychologicznie. Zauważa ciąg przyczynowo-skutkowy.

Procentowe poziomy emocji: * Szczęście: 50% – Wydaje się odrobinę zawyżone biorąc pod uwagę zmęczenie i spadek motywacji pacjenta, jednak brak bólu i dobre odżywianie mogą usprawiedliwiać taki umiarkowany, neutralny stan.

Smutek: 30%, Stres: 40%, Złość: 20% – Bardzo wiarygodne proporcje. Zmęczenie i brak motywacji częściej korelują z podwyższonym stresem (z powodu trudności z regeneracją) i łagodnym smutkiem (zniechęceniem) niż z czystą złością.

Jakość porad (Psychologia Zdrowia):

Porada 1 (Sen): Pacjent spał 6 godzin (co dla wielu osób jest niewystarczające) i zgłasza problemy z regeneracją. Zaproponowanie krótkich drzemek (power naps) jest bardzo trafną, behawioralną interwencją z zakresu psychologii zdrowia.

Porada 2 (Aktywność): Pacjent ma "mniejszą motywację do działania". Model poprawnie zarekomendował lekką aktywność (spacery, joga), co w psychologii określa się mianem "aktywacji behawioralnej". Rozpoczynanie od małych kroków zapobiega przebodźcowaniu u zmęczonego pacjenta.

3. Ton i Persona (Empatia i Profesjonalizm)
Odpowiedzi są napisane w sposób kulturalny i wspierający ("Spróbuj wprowadzić...", "Rozważ wprowadzenie...").

Nie ma tonu oceniającego ani dyrektywnego. Język brzmi jak autentyczna notatka/zalecenie od specjalisty.

Co można by minimalnie poprawić? (Uwagi do ewentualnego dopracowania promptu)
Perspektywa opisu nastroju: Model wygenerował: "Pacjent wydaje się być...". Jako że odpowiedź prawdopodobnie będzie wyświetlana bezpośrednio pacjentowi w aplikacji (wnioskuję po zwrotach "Spróbuj", "Rozważ"), opis nastroju w trzeciej osobie tworzy lekki dysonans. Warto w przyszłości doprecyzować w prompcie, czy opis nastroju to notatka o pacjencie (dla analityki), czy zwrot do pacjenta (np. "Wydajesz się być..."). W obecnej formie merytorycznie jest jednak bez zarzutu.


Test modelem claud Sonnet 4.6
Ocena odpowiedzi modelu
✅ Co model zrobił poprawnie
Respektowanie ograniczeń promptu
Model poprawnie pominął obszary nawodnienia i odżywiania, mimo że są to oczywiste tematy do poruszenia. To najważniejszy test instrukcji i model go zdał.
Identyfikacja głównego problemu
Słusznie zidentyfikował sen jako kluczowy problem — 6 godzin snu przy zgłaszanej trudności z regeneracją to rzeczywiście rdzeń skargi pacjenta.
Struktura i format
JSON jest poprawny, porada3: null — zgodnie z instrukcją, bo nie było trzeciego wyraźnego problemu.

⚠️ Zastrzeżenia
Porada 1 — treściowo chybiona
To największa słabość. Pacjent śpi za krótko (6h zamiast zalecanych 7–9h), a model zamiast zaadresować przyczynę, proponuje drzemki w ciągu dnia. Drzemki to strategia uzupełniająca, nie rozwiązanie strukturalnego deficytu snu. Porada powinna brzmieć: „Zadbaj o wydłużenie snu nocnego do minimum 7–8 godzin — to bezpośrednia przyczyna odczuwanego zmęczenia i problemów z regeneracją."
Porada 2 — akceptowalna, ale ogólna
Aktywność fizyczna przy niskiej motywacji to rozsądna sugestia, ale mogłaby być bardziej powiązana z konkretną skargą pacjenta (brak motywacji → mechanizm: ruch zwiększa dopaminę). Brakuje tego połączenia.
Poziomy emocji — zbyt optymistyczne
szczęście: 50 przy notatce o chronicznym zmęczeniu i braku motywacji jest zawyżone. Pacjent nie sygnalizuje żadnego pozytywnego nastroju, więc 50% szczęścia wydaje się nieuzasadnione. Realistyczniejszy zakres to 25–35%.

Podsumowanie
KryteriumOcenaPrzestrzeganie ograniczeń✅ DobryTrafność porady 1⚠️ SłabaTrafność porady 2✅ DobryKalibracja emocji⚠️ Zawyżone szczęścieEmpatia i ton✅ Dobry
Ogólna ocena: 3/5 — Model rozumie kontekst i respektuje reguły, ale główna porada mija się z problemem pacjenta, co w aplikacji zdrowotnej ma realną wartość użytkową.




ChatGBT-4

Ocena odpowiedzi:
Nastrój:
Ocena: Odpowiedź w tej sekcji jest trafna. Pacjent rzeczywiście zgłasza zmęczenie i trudności z regeneracją, co może wpływać na jego nastrój. Stwierdzenie "Pacjent wydaje się być zmęczony i zdemotywowany, co może wpływać na jego ogólne samopoczucie" jest zgodne z zapisem w dzienniku, w którym pacjent podkreśla spadek motywacji. Dobre zrozumienie problemu.
Procentowe poziomy emocji:
Szczęście (50): Proporcjonalnie ustawiona wartość, pasuje do braku wyraźnej radości, ale i nie wskazuje na brak emocji. Pacjent nie zgłasza emocji skrajnie negatywnych, ale zauważono zmęczenie, które może wpływać na samopoczucie.
Smutek (30): Smutek w tej sytuacji wydaje się nieco zaniżony. Pacjent zgłasza spadek energii i motywacji, co często wiąże się z uczuciem smutku. Warto podnieść ten poziom do 40-50, aby bardziej odzwierciedlał obecny stan.
Stres (40): Pasuje do ogólnych trudności z regeneracją, ale w dzienniku pacjent nie wskazuje na silny stres. Ocena może zostać nieco obniżona, np. do 30-35.
Złość (20): W tej sytuacji złość wydaje się odpowiednio niska, ponieważ pacjent nie wykazuje oznak agresji ani frustracji.
Porady zdrowotne:
Porada1 (sen): Odpowiedź jest trafna, biorąc pod uwagę, że pacjent zgłasza problemy z regeneracją i zmniejszoną energią. Wprowadzenie drzemek jest adekwatnym rozwiązaniem. Dobry wybór.
Porada2 (aktywność): Rozważenie wprowadzenia aktywności fizycznej, jak spacer czy joga, jest także uzasadnione. Aktywność fizyczna może pomóc w zwiększeniu energii i poprawie nastroju. To dobra opcja, chociaż warto bardziej podkreślić potrzebę jej regularności.
Porada3: Brak trzeciej porady jest poprawny, ponieważ nie ma wyraźnych innych problemów, które wymagają interwencji.
Wnioski:
Poziom emocji: Niektóre poziomy mogą być nieco przesadzone, szczególnie smutek. Może warto zaktualizować je, aby lepiej odzwierciedlały stan pacjenta.
Porady: Porady są trafne i dostosowane do zgłoszonych problemów pacjenta. Dobrze odniesiono się do zmęczenia i niskiej energii, sugerując zarówno odpoczynek, jak i aktywność fizyczną.
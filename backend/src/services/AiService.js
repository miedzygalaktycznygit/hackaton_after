const OpenAi = require("openai");
const z = require('zod');
const { zodResponseFormat } = require('openai/helpers/zod');

const BASE_URL = "http://engine.kin.tu.kielce.pl:32597/v1";
const API_KEY = 'sk-WbVjon5KgudCD0YdT-M-_A';
const LLM_MODELS = ['bielik', 'gemma4:small', 'gemma4:large'];

const client = new OpenAi({
  apiKey: API_KEY,
  baseURL: BASE_URL
});

// === SCHEMAT ODPOWIEDZI — 1-3 porady (porada2 i porada3 są opcjonalne) ===
const PoradaSchema = z.object({
  text: z.string(),
  category: z.string(),
});

const MoodAnalysisFormat = z.object({
  nastroj: z.string().describe("Jedno-dwuzdaniowy opis ogólnego nastroju pacjenta"),
  szczescie: z.number().int().min(0).max(100),
  smutek: z.number().int().min(0).max(100),
  stres: z.number().int().min(0).max(100),
  zlosc: z.number().int().min(0).max(100),
  porada1: PoradaSchema.describe("Zawsze wymagana — najważniejsza porada dla pacjenta"),
  porada2: PoradaSchema.nullable().optional().describe("Druga porada — wypełnij TYLKO jeśli pacjent ma inny istotny problem wymagający poprawy"),
  porada3: PoradaSchema.nullable().optional().describe("Trzecia porada — wypełnij TYLKO jeśli są aż 3 różne problemy do poprawy"),
});

/**
 * Analizuje dane z dziennika zdrowia.
 * @param {Object} noteData - dane wpisu z bazy
 * @param {Array}  ineffectiveAdvice - porady które już nie zadziałały [{text, category}]
 * @param {Array}  effectiveAdvice   - porady które zadziałały [{text, category}]
 */
async function analyzeNote(noteData, ineffectiveAdvice = [], effectiveAdvice = []) {
  // Obsługuje oba warianty nazw pól:
  //   ammount_* (podwójne m) — wysyłane z frontendu przez fetch
  //   ammout_*  (pojedyncze m) — zwracane z bazy danych (literowóka w schemacie DB)
  const content          = noteData.content;
  const ammout_sleep     = noteData.ammout_sleep    ?? noteData.ammount_sleep;
  const ammout_of_water  = noteData.ammout_of_water ?? noteData.ammount_of_water;
  const nutrition_intake = noteData.nutrition_intake;
  const date_added       = noteData.date_added;

  // Zbuduj sekcję co użytkownik robi już dobrze (nie powtarzaj porad w tych obszarach)
  const doingWell = [];
  if (parseFloat(ammout_of_water) >= 2.0) {
    doingWell.push(`Nawodnienie: pacjent pije już ${ammout_of_water}L wody dziennie — Nie radzić pić więcej wody`);
  }
  if (parseFloat(ammout_sleep) >= 7.5) {
    doingWell.push(`Sen: pacjent śpi ${ammout_sleep}h — nie radzić wcześniej kłaść się spać`);
  }
  if (nutrition_intake && nutrition_intake.trim().length > 10) {
    doingWell.push(`Odżywianie: pacjent opisał dziśiejszy posiłek, może skupić się na innym aspekcie`);
  }

  let doingWellSection = '';
  if (doingWell.length > 0) {
    doingWellSection = `
✅ CO UŻYTKOWNIK JUŻ ROBI DOBRZE (NIE DORADZAJ W TYCH OBSZARACH — to byłoby bez sensu):\n`
      + doingWell.map(d => `  - ${d}`).join('\n') + '\n';
  }

  let historySection = '';
  if (ineffectiveAdvice.length > 0) {
    historySection += `
⚠️ PORADY KTÓRE ZOSTAŁY ZASTOSOWANE ALE NIE POMOGŁY — ABSOLUTNIE NIE POWTARZAJ ICH ANI ŻADNYCH ICH WARIANTÓW:\n`;
    ineffectiveAdvice.forEach((a, i) => {
      historySection += `  ${i + 1}. [${a.category}] ${a.advicetext}\n`;
    });
    historySection += `Zamiast tego zaproponuj zupełnie inne podejście do tego samego problemu.\n`;
  }
  if (effectiveAdvice.length > 0) {
    historySection += `\n✅ PORADY KTÓRE ZADZIAŁAŁY (możesz je rozbudować lub dać kolejny krok):\n`;
    effectiveAdvice.forEach((a, i) => {
      historySection += `  ${i + 1}. [${a.category}] ${a.advicetext}\n`;
    });
  }

  const prompt = `Jesteś doświadczonym psychologiem zdrowia analizującym dziennik zdrowia pacjenta.
Na podstawie poniższych danych z dziennika oceń stan pacjenta.
${doingWellSection}${historySection}
=== DANE Z DZIENNIKA ===
Data wpisu: ${date_added ? new Date(date_added).toLocaleDateString('pl-PL') : 'nieznana'}
Godziny snu: ${ammout_sleep != null ? ammout_sleep + ' godz.' : 'brak danych'}
Wypita woda: ${ammout_of_water != null ? ammout_of_water + ' L' : 'brak danych'}
Odżywianie: ${nutrition_intake || 'brak danych'}
Notatka pacjenta: ${content || 'brak'}
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

Odpowiadaj po polsku, empatycznie i profesjonalnie.`;

  const completion = await client.chat.completions.create({
    model: LLM_MODELS[0],
    messages: [{ role: "user", content: prompt }],
    response_format: zodResponseFormat(MoodAnalysisFormat, "mood_analysis"),
  });

  const raw = completion.choices[0].message.content;
  return JSON.parse(raw);
}

// Schemat tygodniowego podsumowania (porady nadal jako 3 osobne)
const WeekSummaryFormat = MoodAnalysisFormat;

async function analyzeWeekSummary(notes, ineffectiveAdvice = [], effectiveAdvice = []) {
  if (!notes || notes.length === 0) {
    return {
      nastroj: 'Brak danych', szczescie: 0, smutek: 0, stres: 0, zlosc: 0,
      porada1: { text: 'Dodaj wpisy, aby otrzymać analizę.', category: 'ogólne' },
      porada2: { text: 'Regularność wpisów pozwala lepiej śledzić samopoczucie.', category: 'ogólne' },
      porada3: { text: 'Spróbuj dodać wpis każdego dnia przez tydzień.', category: 'ogólne' },
    };
  }

  const notesText = notes.map((n, i) => {
    return `Wpis ${i + 1} (${n.date_added ? new Date(n.date_added).toLocaleDateString('pl-PL') : '?'}):
  Sen: ${n.ammout_sleep}h, Woda: ${n.ammout_of_water}L, Jedzenie: ${n.nutrition_intake || 'brak'}, Notatka: ${n.content || 'brak'}`;
  }).join('\n');

  const avgSleep = (notes.reduce((s, n) => s + (parseFloat(n.ammout_sleep) || 0), 0) / notes.length).toFixed(1);
  const avgWater = (notes.reduce((s, n) => s + (parseFloat(n.ammout_of_water) || 0), 0) / notes.length).toFixed(1);

  let historySection = '';
  if (ineffectiveAdvice.length > 0) {
    historySection += `\n⚠️ Porady które nie zadziałały (NIE powtarzaj):\n` +
      ineffectiveAdvice.map(a => `  - [${a.category}] ${a.advicetext}`).join('\n') + '\n';
  }

  const prompt = `Jesteś psychologiem zdrowia. Przeanalizuj tygodniowy dziennik pacjenta.
${historySection}
=== DANE TYGODNIOWE ===
Liczba wpisów: ${notes.length}, Średni sen: ${avgSleep}h/noc, Średnia woda: ${avgWater}L/dzień
Wpisy:
${notesText}
========================

Wygeneruj tygodniowe podsumowanie z 3 poradami na kolejny tydzień. Odpowiadaj po polsku.`;

  const completion = await client.chat.completions.create({
    model: LLM_MODELS[0],
    messages: [{ role: "user", content: prompt }],
    response_format: zodResponseFormat(WeekSummaryFormat, "week_summary"),
  });

  return JSON.parse(completion.choices[0].message.content);
}

module.exports = { analyzeNote, analyzeWeekSummary };
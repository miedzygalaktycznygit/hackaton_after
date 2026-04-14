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

// Schemat odpowiedzi modelu - pola procentowe jako liczby całkowite 0-100
const MoodAnalysisFormat = z.object({
  nastroj: z.string().describe("Jedno-dwuzdaniowy opis ogólnego nastroju pacjenta"),
  rekomendacje: z.string().describe("Konkretne, empatyczne rekomendacje dla pacjenta (2-4 zdania)"),
  szczescie: z.number().int().min(0).max(100).describe("Procent szczęścia odczuwanego przez pacjenta (0-100)"),
  smutek: z.number().int().min(0).max(100).describe("Procent smutku odczuwanego przez pacjenta (0-100)"),
  stres: z.number().int().min(0).max(100).describe("Procent stresu odczuwanego przez pacjenta (0-100)"),
  zlosc: z.number().int().min(0).max(100).describe("Procent złości/frustracji odczuwanej przez pacjenta (0-100)")
});

/**
 * Analizuje dane z dziennika zdrowia i zwraca ocenę nastroju przez model językowy.
 *
 * @param {Object} noteData - dane wpisu z bazy
 * @param {string} noteData.content     - treść notatki (zawiera info o bólu i ogólne notatki)
 * @param {number} noteData.ammout_sleep  - godziny snu
 * @param {number} noteData.ammout_of_water - litry wody
 * @param {string} noteData.nutrition_intake - co zjadł pacjent
 * @param {string} [noteData.date_added] - data wpisu
 * @returns {Promise<Object>} - wynik analizy AI zgodny ze schematem MoodAnalysisFormat
 */
async function analyzeNote(noteData) {
  const { content, ammout_sleep, ammout_of_water, nutrition_intake, date_added } = noteData;

  // Zbuduj szczegółowy prompt z danych formularza
  const prompt = `Jesteś doświadczonym psychologiem zdrowia analizującym dziennik zdrowia pacjenta. 
Na podstawie poniższych danych z dzisiejszego wpisu oceń stan emocjonalny i fizyczny pacjenta.

=== DANE Z DZIENNIKA ===
Data wpisu: ${date_added ? new Date(date_added).toLocaleDateString('pl-PL') : 'nieznana'}
Godziny snu: ${ammout_sleep != null ? ammout_sleep + ' godz.' : 'brak danych'}
Wypita woda: ${ammout_of_water != null ? ammout_of_water + ' L' : 'brak danych'}
Odżywianie: ${nutrition_intake || 'brak danych'}
Notatka pacjenta: ${content || 'brak'}
=======================

Na podstawie tych danych:
1. Opisz ogólny nastrój pacjenta (pole: nastroj)
2. Podaj konkretne, empatyczne rekomendacje dotyczące zdrowia i samopoczucia (pole: rekomendacje)  
3. Oszacuj w procentach poziom emocji: szczęście, smutek, stres, złość (pola: szczescie, smutek, stres, zlosc)

Uwaga: suma procentów emocji nie musi wynosić 100 - każda emocja jest niezależna.
Odpowiadaj po polsku, w sposób empatyczny i profesjonalny.`;

  const completion = await client.chat.completions.create({
    model: LLM_MODELS[0],
    messages: [{ role: "user", content: prompt }],
    response_format: zodResponseFormat(MoodAnalysisFormat, "mood_analysis"),
  });

  const raw = completion.choices[0].message.content;
  const parsed = JSON.parse(raw);
  return parsed;
}

/**
 * 
 *
 * @param {Array} notes - tablica wpisów z tygodnia
 * @returns {Promise<Object>}
 */
async function analyzeWeekSummary(notes) {
  if (!notes || notes.length === 0) {
    return { nastroj: 'Brak danych', rekomendacje: 'Dodaj wpisy, aby otrzymać analizę.', szczescie: 0, smutek: 0, stres: 0, zlosc: 0 };
  }

  const notesText = notes.map((n, i) => {
    return `Wpis ${i + 1} (${n.date_added ? new Date(n.date_added).toLocaleDateString('pl-PL') : '?'}):
  - Sen: ${n.ammout_sleep} godz., Woda: ${n.ammout_of_water} L
  - Jedzenie: ${n.nutrition_intake || 'brak'}
  - Notatka: ${n.content || 'brak'}`;
  }).join('\n\n');

  const avgSleep = (notes.reduce((s, n) => s + (parseFloat(n.ammout_sleep) || 0), 0) / notes.length).toFixed(1);
  const avgWater = (notes.reduce((s, n) => s + (parseFloat(n.ammout_of_water) || 0), 0) / notes.length).toFixed(1);

  const prompt = `Jesteś doświadczonym psychologiem zdrowia. Przeanalizuj poniższe dane z tygodniowego dziennika zdrowia pacjenta.

=== DANE TYGODNIOWE ===
Liczba wpisów: ${notes.length}
Średni sen: ${avgSleep} godz./noc
Średnie nawodnienie: ${avgWater} L/dzień

Szczegółowe wpisy:
${notesText}
======================

Dokonaj holistycznej oceny tygodnia pacjenta:
1. Opisz dominujący nastrój tygodnia (pole: nastroj)
2. Zaproponuj konkretne rekomendacje na kolejny tydzień (pole: rekomendacje)
3. Podaj średnie poziomy emocji w procentach dla całego tygodnia (szczescie, smutek, stres, zlosc)

Odpowiadaj po polsku, w sposób empatyczny i wspierający.`;

  const completion = await client.chat.completions.create({
    model: LLM_MODELS[0],
    messages: [{ role: "user", content: prompt }],
    response_format: zodResponseFormat(MoodAnalysisFormat, "mood_analysis"),
  });

  const raw = completion.choices[0].message.content;
  const parsed = JSON.parse(raw);
  return parsed;
}

module.exports = { analyzeNote, analyzeWeekSummary };
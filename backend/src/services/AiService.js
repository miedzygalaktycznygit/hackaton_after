const OpenAi = require("openai");
const z = require('zod');
const { zodResponseFormat } = require('openai/helpers/zod');

const BASE_URL = process.env.BASE_URL || "http://engine.kin.tu.kielce.pl:32597/v1";
const API_KEY = process.env.API_KEY || 'sk-WbVjon5KgudCD0YdT-M-_A';
const LLM_MODEL = process.env.LLM_MODEL || 'bielik';

const client = new OpenAi({
  apiKey: API_KEY,
  baseURL: BASE_URL
});

// === SCHEMAT ODPOWIEDZI — 1-3 porady ===
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

const WeekSummaryFormat = MoodAnalysisFormat;

/**
 * Usuwa dane wrażliwe (PII) z notatki użytkownika przed wysłaniem do zewnętrznego AI.
 */
function redactPII(text) {
  if (!text) return '';
  let s = text;
  // 1. Adresy e-mail
  s = s.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]');
  // 2. PESEL (11 cyfr)
  s = s.replace(/\b\d{11}\b/g, '[PESEL]');
  // 3. Numery telefonów (np. +48 123 456 789, 123-456-789, itp.)
  s = s.replace(/(?:\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,4}/g, '[TELEFON]');
  // 4. Polskie najpopularniejsze imiona
  const imiona = [
    'Jan', 'Maria', 'Anna', 'Krzysztof', 'Piotr', 'Paweł', 'Tomasz', 'Andrzej', 'Katarzyna',
    'Małgorzata', 'Agnieszka', 'Barbara', 'Ewa', 'Janusz', 'Mariusz', 'Michał', 'Adam'
  ];
  for (const imie of imiona) {
    const regex = new RegExp(`\\b${imie}\\b`, 'gi');
    s = s.replace(regex, '[IMIĘ]');
  }
  return s;
}

/**
 * Generuje symulowaną analizę nastroju (Mock AI) w przypadku braku połączenia z API.
 */
function generateMockAnalysis(noteData, ineffectiveAdvice = []) {
  const content = (noteData.content || '').toLowerCase();
  const sleep = parseFloat(noteData.ammout_sleep ?? noteData.ammount_sleep ?? 7.0);
  const water = parseFloat(noteData.ammout_of_water ?? noteData.ammount_of_water ?? 1.5);
  
  let szczescie = 60;
  let smutek = 20;
  let stres = 20;
  let zlosc = 10;
  let nastroj = "Ogólne samopoczucie jest stabilne.";

  if (content.includes("smut") || content.includes("źle") || content.includes("płacz") || content.includes("depres")) {
    smutek = 75; szczescie = 25; nastroj = "Wykryto obniżony nastrój i symptomy smutku.";
  } else if (content.includes("stres") || content.includes("prac") || content.includes("napię") || content.includes("nerw")) {
    stres = 80; szczescie = 30; nastroj = "Poziom stresu jest podwyższony, prawdopodobnie przez pracę lub codzienne obowiązki.";
  } else if (content.includes("super") || content.includes("dobrz") || content.includes("świetn") || content.includes("rado")) {
    szczescie = 85; smutek = 10; stres = 10; nastroj = "Wykazujesz bardzo dobry nastrój, radosną energię i optymizm.";
  } else if (content.includes("złość") || content.includes("wściek") || content.includes("denerw") || content.includes("wkurw")) {
    zlosc = 80; stres = 50; nastroj = "Występuje podwyższony poziom frustracji lub złości.";
  }

  if (sleep < 6.0) {
    stres += 15;
    smutek += 10;
  }
  if (water < 1.5) {
    stres += 10;
  }

  szczescie = Math.min(100, Math.max(0, szczescie));
  smutek = Math.min(100, Math.max(0, smutek));
  stres = Math.min(100, Math.max(0, stres));
  zlosc = Math.min(100, Math.max(0, zlosc));

  // Baza opcji dla poszczególnych kategorii
  const mockOptions = {
    stres: [
      "Wysoki poziom stresu. Spróbuj ćwiczeń głębokiego oddychania (metoda 4-7-8) przez 5 minut dziennie.",
      "Zgłaszasz wysoki stres. Spróbuj wyjść na 20-minutowy spacer bez telefonu, aby wyciszyć przebodźcowany umysł.",
      "Czujesz duże napięcie. Zaparz kubek melisy lub rumianku i zrób sobie 10 minut odpoczynku od ekranów."
    ],
    ból: [
      "Zgłaszasz ból fizyczny. Zadbaj o odpoczynek i regenerację, a przy nawracającym bólu skonsultuj się z lekarzem.",
      "Odczuwasz ból. Spróbuj delikatnego rozciągania lub ciepłego okładu na obolałe miejsce.",
      "Ból fizyczny utrudnia funkcjonowanie. Zrób przerwę, weź ciepłą kąpiel i pozwól ciału odpocząć."
    ],
    nawodnienie: [
      `Wypijasz tylko ${water}L wody dziennie. Trzymaj butelkę wody pod ręką, aby pamiętać o piciu.`,
      "Niskie nawodnienie. Spróbuj pić mały łyk wody co 15 minut, ustawiając przypomnienie na telefonie."
    ],
    sen: [
      `Śpisz tylko ${sleep}h. Postaraj się kłaść spać o stałej porze i ograniczyć niebieskie światło przed snem.`,
      "Mało snu. Spróbuj przewietrzyć sypialnię przed snem i zadbać o całkowite zaciemnienie pokoju."
    ],
    aktywność: [
      "Zadbaj o regularną aktywność fizyczną, np. 30-minutowy spacer na świeżym powietrzu.",
      "Aktywność fizyczna pomaga rozładować napięcie. Zrób krótką, 10-minutową sesję jogi lub rozciągania."
    ]
  };

  function selectMockAdvice(category, options) {
    for (const opt of options) {
      let isIneffective = false;
      for (const bad of ineffectiveAdvice) {
        const badText = (bad.advicetext || '').toLowerCase();
        const optText = opt.toLowerCase();
        
        // Zgrubne porównanie tekstów dla trybu offline
        if (badText === optText || 
            (optText.includes("oddychania") && badText.includes("oddychania")) ||
            (optText.includes("spacer") && badText.includes("spacer")) ||
            (optText.includes("wody") && badText.includes("wody")) ||
            (optText.includes("śpisz") && badText.includes("śpisz")) ||
            (optText.includes("okładu") && badText.includes("okładu"))) {
          isIneffective = true;
          break;
        }
      }
      if (!isIneffective) {
        return { text: opt, category };
      }
    }
    return { text: options[options.length - 1], category };
  }

  let porada1 = selectMockAdvice("aktywność", mockOptions.aktywność);
  let porada2 = null;
  let porada3 = null;

  if (sleep < 7.0) {
    porada1 = selectMockAdvice("sen", mockOptions.sen);
  } else if (water < 2.0) {
    porada1 = selectMockAdvice("nawodnienie", mockOptions.nawodnienie);
  }

  if (stres > 50) {
    const stressAdvice = selectMockAdvice("stres", mockOptions.stres);
    if (porada1.category === "sen" || porada1.category === "nawodnienie") {
      porada2 = stressAdvice;
    } else {
      porada1 = stressAdvice;
    }
  }

  const hasPain = content.includes("ból") && 
                  !content.includes("ból: no pain") && 
                  !content.includes("ból: brak") && 
                  !content.includes("ból: no");
  if (hasPain) {
    const painAdvice = selectMockAdvice("ból", mockOptions.ból);
    if (!porada2) porada2 = painAdvice;
    else porada3 = painAdvice;
  }

  return { nastroj, szczescie, smutek, stres, zlosc, porada1, porada2, porada3 };
}

/**
 * Generuje symulowane podsumowanie tygodnia (Mock AI) w przypadku braku połączenia z API.
 */
function generateMockWeekSummary(notes) {
  if (!notes || notes.length === 0) {
    return {
      nastroj: 'Brak wpisów w tym tygodniu.', szczescie: 50, smutek: 50, stres: 50, zlosc: 50,
      porada1: { text: 'Dodaj wpisy, aby otrzymać analizę.', category: 'ogólne' },
      porada2: { text: 'Regularność wpisów pozwala lepiej śledzić samopoczucie.', category: 'ogólne' },
      porada3: { text: 'Spróbuj dodać wpis każdego dnia przez tydzień.', category: 'ogólne' }
    };
  }

  let sumSzczescie = 0, sumSmutek = 0, sumStres = 0, sumZlosc = 0;
  let count = 0;

  for (const n of notes) {
    const analysis = n.analysis_json ? JSON.parse(n.analysis_json) : generateMockAnalysis(n);
    sumSzczescie += analysis.szczescie;
    sumSmutek += analysis.smutek;
    sumStres += analysis.stres;
    sumZlosc += analysis.zlosc;
    count++;
  }

  const szczescie = Math.round(sumSzczescie / count);
  const smutek = Math.round(sumSmutek / count);
  const stres = Math.round(sumStres / count);
  const zlosc = Math.round(sumZlosc / count);

  let nastroj = "Twój tydzień był stabilny emocjonalnie.";
  if (stres > 60) nastroj = "W tym tygodniu towarzyszył Ci wyższy poziom stresu i napięcia.";
  else if (szczescie > 70) nastroj = "To był radosny tydzień z wysokim poziomem pozytywnego samopoczucia.";
  else if (smutek > 50) nastroj = "W tym tygodniu przeważało obniżone samopoczucie i smutek.";

  return {
    nastroj,
    szczescie,
    smutek,
    stres,
    zlosc,
    porada1: { text: "Kontynuuj codzienne zapisywanie swoich odczuć, aby lepiej rozumieć swoje emocje.", category: "ogólne" },
    porada2: { text: "Zwróć uwagę na jakość i długość snu, które mocno wpływają na nastrój.", category: "sen" },
    porada3: { text: "Znajdź codziennie choćby 15 minut na aktywność tylko dla siebie.", category: "aktywność" }
  };
}

/**
 * Generuje embedding (wektor osadzenia) tekstu za pomocą modelu stella-embeddings.
 */
async function generateEmbedding(text) {
  if (!text || text.trim() === '') {
    return new Array(1024).fill(0);
  }
  const cleanText = redactPII(text);
  try {
    const response = await client.embeddings.create({
      input: cleanText,
      model: process.env.EMB_MODEL || "stella-embeddings"
    });
    return response.data[0].embedding;
  } catch (err) {
    console.warn("Błąd generowania embeddingu (offline/brak API) - generuję wektor testowy:", err.message);
    const vector = new Array(1024).fill(0);
    const words = cleanText.toLowerCase().split(/\s+/);
    for (let i = 0; i < vector.length; i++) {
      let hash = 0;
      for (const word of words) {
        for (let j = 0; j < word.length; j++) {
          hash = (hash * 31 + word.charCodeAt(j)) % 1000000;
        }
      }
      vector[i] = Math.sin(hash + i) * 0.1;
    }
    return vector;
  }
}

/**
 * Oblicza podobieństwo cosinusowe pomiędzy dwoma wektorami.
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Analizuje dane pojedynczego wpisu.
 */
async function analyzeNote(noteData, ineffectiveAdvice = [], effectiveAdvice = []) {
  const rawContent = noteData.content || '';
  const cleanContent = redactPII(rawContent);

  const ammout_sleep = noteData.ammout_sleep ?? noteData.ammount_sleep;
  const ammout_of_water = noteData.ammout_of_water ?? noteData.ammount_of_water;
  const nutrition_intake = redactPII(noteData.nutrition_intake || '');
  const date_added = noteData.date_added;

  const doingWell = [];
  if (parseFloat(ammout_of_water) >= 2.0) {
    doingWell.push(`Nawodnienie: pacjent pije już ${ammout_of_water}L wody dziennie.`);
  }
  if (parseFloat(ammout_sleep) >= 7.5) {
    doingWell.push(`Sen: pacjent śpi ${ammout_sleep}h.`);
  }

  let doingWellSection = '';
  if (doingWell.length > 0) {
    doingWellSection = `\n✅ CO UŻYTKOWNIK ROBI DOBRZE (NIE ZALECAJ W TYCH OBSZARACH):\n`
      + doingWell.map(d => `  - ${d}`).join('\n') + '\n';
  }

  let historySection = '';
  if (ineffectiveAdvice.length > 0) {
    historySection += `\n⚠️ PORADY KTÓRE NIE ZADZIAŁAŁY (NIE POWTARZAJ ICH):\n` +
      ineffectiveAdvice.map(a => `  - [${a.category}] ${a.advicetext}`).join('\n') + '\n';
  }

  let successSection = '';
  if (effectiveAdvice && effectiveAdvice.length > 0) {
    successSection += `\n✅ SKUTECZNE PORADY Z PRZESZŁOŚCI (WARTO JE ZASTOSOWAĆ W PODOBNEJ SYTUACJI):\n` +
      effectiveAdvice.map(a => `  - [${a.category}] ${a.advicetext}`).join('\n') + '\n';
  }

  const prompt = `Jesteś psychologiem zdrowia. Oceń stan pacjenta na podstawie wpisu dziennika.
${doingWellSection}${historySection}${successSection}
=== WPIS DZIENNIKA ===
Data: ${date_added ? new Date(date_added).toLocaleDateString('pl-PL') : 'brak'}
Sen: ${ammout_sleep}h, Woda: ${ammout_of_water}L, Jedzenie: ${nutrition_intake}
Notatka: ${cleanContent}
======================

Wygeneruj ocenę stanu nastroju oraz 1-3 porady. Odpowiadaj po polsku.
Zasady dotyczące porad:
1. Pod żadnym pozorem nie powielaj ani nie zalecaj porad podobnych do tych, które okazały się NIESKUTECZNE (oznaczonych jako ⚠️).
   Użytkownik wyraźnie zgłosił, że te metody dla niego NIE działają. Zmień całkowicie strategię i zaproponuj coś zupełnie innego (np. jeśli nie zadziałała medytacja/mindfulness, nie proponuj żadnej innej formy medytacji ani jogi – zamiast tego poleć np. aktywność fizyczną, techniki oddechowe, wyjście na spacer lub kontakt z bliskimi).
2. Jeśli pacjent ma problem analogiczny do tego, który w przeszłości został pomyślnie rozwiązany dzięki skutecznej poradzie (oznaczonej jako ✅), spróbuj zalecić tę samą lub bardzo zbliżoną poradę.`;

  let attempt = 0;
  let currentPrompt = prompt;
  let resultAnalysis = null;

  while (attempt < 3) {
    try {
      const completion = await client.chat.completions.create({
        model: LLM_MODEL,
        messages: [{ role: "user", content: currentPrompt }],
        response_format: zodResponseFormat(MoodAnalysisFormat, "mood_analysis"),
      });
      resultAnalysis = JSON.parse(completion.choices[0].message.content);
    } catch (err) {
      console.error("Błąd API OpenAI (analiza wpisu):", err.message);
      throw err;
    }

    // Weryfikacja wektorowa nowo wygenerowanych porad
    let collisionDetected = false;
    let collisionText = "";

    const newAdvices = [resultAnalysis.porada1, resultAnalysis.porada2, resultAnalysis.porada3].filter(Boolean);

    for (const adv of newAdvices) {
      if (!adv.text) continue;
      
      // Oblicz embedding dla wygenerowanej porady
      let newEmb = null;
      try {
        newEmb = await generateEmbedding(adv.text);
      } catch (e) {
        console.warn("Błąd generowania embeddingu podczas weryfikacji:", e.message);
      }

      if (newEmb) {
        // Porównaj z nieskutecznymi poradami pacjenta
        for (const bad of ineffectiveAdvice) {
          if (bad.embedding) {
            const sim = cosineSimilarity(newEmb, bad.embedding);
            if (sim > 0.85) {
              collisionDetected = true;
              collisionText = bad.advicetext;
              console.log(`[AI Verification] Kolizja! Nowa porada "${adv.text}" jest zbyt podobna do nieskutecznej porady: "${bad.advicetext}" (Podobieństwo: ${sim.toFixed(2)})`);
              break;
            }
          }
        }
      }
      if (collisionDetected) break;
    }

    if (!collisionDetected) {
      // Brak kolizji - zwracamy wynik
      return resultAnalysis;
    }

    // Wykryto kolizję - ponawiamy generowanie z doprecyzowanym promptem
    console.log(`[AI Verification] Próba ${attempt + 1} nieudana. Ponawiam generowanie porad bez powtórzeń...`);
    currentPrompt += `\n\n[System] UWAGA: W poprzedniej próbie wygenerowałeś poradę zbyt podobną do nieskutecznej porady: "${collisionText}". Wygeneruj inną, unikalną poradę w tym zakresie, która nie powtarza tego błędu.`;
    attempt++;
  }

  return resultAnalysis;
}

/**
 * Analizuje dane z całego tygodnia.
 */
async function analyzeWeekSummary(notes, ineffectiveAdvice = [], effectiveAdvice = []) {
  if (!notes || notes.length === 0) {
    return generateMockWeekSummary(notes);
  }

  const sanitizedNotes = notes.map(n => ({
    ...n,
    content: redactPII(n.content || ''),
    nutrition_intake: redactPII(n.nutrition_intake || '')
  }));

  const notesText = sanitizedNotes.map((n, i) => {
    return `Wpis ${i + 1} (${n.date_added ? new Date(n.date_added).toLocaleDateString('pl-PL') : '?'}):
  Sen: ${n.ammout_sleep}h, Woda: ${n.ammout_of_water}L, Jedzenie: ${n.nutrition_intake || 'brak'}, Notatka: ${n.content || 'brak'}`;
  }).join('\n');

  const avgSleep = (sanitizedNotes.reduce((s, n) => s + (parseFloat(n.ammout_sleep) || 0), 0) / sanitizedNotes.length).toFixed(1);
  const avgWater = (sanitizedNotes.reduce((s, n) => s + (parseFloat(n.ammout_of_water) || 0), 0) / sanitizedNotes.length).toFixed(1);

  let historySection = '';
  if (ineffectiveAdvice.length > 0) {
    historySection += `\n⚠️ Porady które nie zadziałały (NIE powtarzaj):\n` +
      ineffectiveAdvice.map(a => `  - [${a.category}] ${a.advicetext}`).join('\n') + '\n';
  }

  const prompt = `Jesteś psychologiem zdrowia. Przeanalizuj tygodniowy dziennik pacjenta.
${historySection}
=== DANE TYGODNIOWE ===
Liczba wpisów: ${sanitizedNotes.length}, Średni sen: ${avgSleep}h, Średnia woda: ${avgWater}L
Wpisy:
${notesText}
========================

Wygeneruj podsumowanie tygodniowe z 3 poradami. Odpowiadaj po polsku.`;

  try {
    const completion = await client.chat.completions.create({
      model: LLM_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: zodResponseFormat(WeekSummaryFormat, "week_summary"),
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error("Błąd API OpenAI (podsumowanie tygodnia):", err.message);
    throw err;
  }
}

module.exports = {
  redactPII,
  generateMockAnalysis,
  generateMockWeekSummary,
  generateEmbedding,
  cosineSimilarity,
  analyzeNote,
  analyzeWeekSummary
};
const { InitDb } = require('./src/db/db_init');
const { addNote, updateNoteAnalysis, updateNoteEmbedding, searchNotesSemantic } = require('./src/services/NoteService');
const { analyzeNote, generateEmbedding } = require('./src/services/AiService');

async function run() {
  console.log("Inicjalizacja bazy danych i automatyczna migracja...");
  await InitDb();

  const userId = 1;

  // Wyczyść stare testowe wpisy dla userId = 1 w celach testu
  const { pool } = require('./src/db/db_config');
  await pool.query("DELETE FROM Notes WHERE UserId = $1", [userId]);

  const testNotes = [
    {
      content: "Dzisiaj czuję się wspaniale. Pogoda jest piękna, a spacer w lesie dał mi mnóstwo energii i radości.",
      ammout_sleep: 8.0,
      ammout_of_water: 2.2,
      nutrition_intake: "Sałatka, owoce, kurczak",
      date_added: "2026-06-25T12:00:00.000Z"
    },
    {
      content: "Strasznie boli mnie głowa. Czuję potworne zmęczenie i stres związany z projektem w pracy. Chyba mam migrenę.",
      ammout_sleep: 5.0,
      ammout_of_water: 0.8,
      nutrition_intake: "Kawa i pączek",
      date_added: "2026-06-26T12:00:00.000Z"
    },
    {
      content: "Brzuch mnie boli po wczorajszym obiedzie. Mam mdłości i ogólny dyskomfort żołądkowy.",
      ammout_sleep: 7.0,
      ammout_of_water: 1.2,
      nutrition_intake: "Pizza i napój gazowany",
      date_added: "2026-06-27T12:00:00.000Z"
    }
  ];

  console.log("Wstawianie notatek testowych wraz z analizami i embeddingami...");
  for (const n of testNotes) {
    const note = await addNote(userId, n.content, n.ammout_sleep, n.ammout_of_water, n.nutrition_intake, n.date_added);
    
    // Generowanie i zapisywanie analizy
    const analysis = await analyzeNote(note);
    await updateNoteAnalysis(note.id, {
      nastroj: analysis.nastroj,
      szczescie: analysis.szczescie,
      smutek: analysis.smutek,
      stres: analysis.stres,
      zlosc: analysis.zlosc,
    });

    // Generowanie i zapisywanie embeddingu
    const emb = await generateEmbedding(n.content);
    await updateNoteEmbedding(note.id, emb);
    console.log(`✅ Dodano wpis ID: ${note.id} | Treść: "${n.content.substring(0, 30)}..."`);
  }

  console.log("\n--- TEST WYSZUKIWANIA SEMANTYCZNEGO (RAM VECTOR DB) ---");
  
  const searchQueries = [
    "ból głowy i zmęczenie",
    "dobre samopoczucie spacer",
    "problem z żołądkiem jedzenie"
  ];

  for (const q of searchQueries) {
    console.log(`\nSzukam: "${q}"`);
    const results = await searchNotesSemantic(userId, q, 3);
    results.forEach((r, idx) => {
      console.log(`  [${idx + 1}] ID: ${r.id} | Wynik podobieństwa: ${r.score}`);
      console.log(`      Treść wpisu: "${r.content}"`);
    });
  }

  await pool.end();
}

run().catch(console.error);

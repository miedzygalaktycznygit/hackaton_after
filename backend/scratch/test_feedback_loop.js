require('dotenv').config();
const { analyzeNote, generateEmbedding } = require('../src/services/AiService');
const { pool } = require('../src/db/db_config');

async function testFeedbackLoop() {
  console.log("=== Rozpoczynamy automatyczny test pętli feedbacku AI ===");

  const userId = 1;
  const noteId = 999; // Mock note ID

  // 1. Definiujemy nieskuteczną poradę
  const badAdviceText = "Wypij 2 litry zimnej wody mineralnej z cytryną, aby poprawić nawodnienie i złagodzić ból głowy.";
  console.log(`\n1. Generujemy embedding dla nieskutecznej porady: "${badAdviceText}"`);
  
  const badEmb = await generateEmbedding(badAdviceText);

  const ineffectiveAdvice = [
    {
      category: 'nawodnienie',
      advicetext: badAdviceText,
      embedding: badEmb
    }
  ];

  // 2. Tworzymy mockowany wpis, który dotyczy tego samego problemu (nawodnienia / bólu głowy)
  const noteData = {
    content: "Strasznie boli mnie głowa, czuję duże zmęczenie i suchość w ustach.",
    ammout_sleep: 6.0,
    ammout_of_water: 0.5,
    nutrition_intake: "kawa i słodycze",
    date_added: new Date('2026-06-03T12:00:00')
  };

  console.log("\n2. Wywołujemy analyzeNote z listą nieskutecznych porad...");
  console.log("System powinien wygenerować analizę i automatycznie odrzucić porady zbyt zbliżone do porady o piciu wody.");

  const start = Date.now();
  const analysis = await analyzeNote(noteData, ineffectiveAdvice, []);
  const duration = Date.now() - start;

  console.log(`\nAnaliza zakończona w ${duration}ms.`);
  console.log("\nWygenerowany wynik:");
  console.log(JSON.stringify(analysis, null, 2));

  // Sprawdzamy czy któraś z wygenerowanych porad nie jest zbyt podobna do badAdviceText
  console.log("\n3. Weryfikacja wyników:");
  const advices = [analysis.porada1, analysis.porada2, analysis.porada3].filter(Boolean);
  
  for (const adv of advices) {
    if (!adv.text) continue;
    const emb = await generateEmbedding(adv.text);
    // Liczymy similarity
    let dot = 0, nA = 0, nB = 0;
    for (let i = 0; i < emb.length; i++) {
      dot += emb[i] * badEmb[i];
      nA += emb[i] * emb[i];
      nB += badEmb[i] * badEmb[i];
    }
    const sim = dot / (Math.sqrt(nA) * Math.sqrt(nB));
    console.log(`- Porada: "${adv.text}" -> Podobieństwo do nieskutecznej rady: ${sim.toFixed(4)}`);
    if (sim > 0.85) {
      console.error(`❌ BŁĄD: Wygenerowano poradę zbyt podobną do nieskutecznej! (${sim.toFixed(4)})`);
    } else {
      console.log(`✅ OK: Porada jest bezpiecznie unikalna.`);
    }
  }

  pool.end();
  console.log("\n=== Test zakończony ===");
}

testFeedbackLoop().catch(err => {
  console.error(err);
  pool.end();
});

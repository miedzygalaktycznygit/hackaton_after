const { analyzeNote, analyzeWeekSummary, generateEmbedding } = require('../services/AiService');
const { returnNotesForWeek, updateNoteAnalysis, updateNoteEmbedding } = require('../services/NoteService');
const { saveAdvice, getPendingAdvice, markAdviceFeedback, getIneffectiveAdvice, getEffectiveAdvice, getAdviceForNote } = require('../services/AdviceService');

// POST /ai/analyze-note
// Body: { noteData, noteId, userId }
async function analyzeNoteHandler(req, res) {
  try {
    const { noteData, noteId, userId } = req.body;
    if (!noteData) return res.status(400).json({ error: 'Brak noteData' });

    const uid = userId || noteData.userId || 1;

    const [ineffective, effective] = await Promise.all([
      getIneffectiveAdvice(uid),
      getEffectiveAdvice(uid),
    ]);

    const analysis = await analyzeNote(noteData, ineffective, effective);

    // Zapisz analizę i porady do bazy jeśli mamy noteId
    let savedAdvices = [];
    if (noteId) {
      const advices = [analysis.porada1, analysis.porada2, analysis.porada3].filter(Boolean);
      // Równolegle: zapisz porady, zapisz analizę do wpisu i zapisz embedding
      [savedAdvices] = await Promise.all([
        saveAdvice(uid, noteId, advices),
        updateNoteAnalysis(noteId, {
          nastroj: analysis.nastroj,
          szczescie: analysis.szczescie,
          smutek: analysis.smutek,
          stres: analysis.stres,
          zlosc: analysis.zlosc,
        }),
        generateEmbedding(noteData.content || '').then(emb => updateNoteEmbedding(noteId, emb))
      ]);
    }

    res.status(200).json({ analysis, adviceIds: savedAdvices.map(a => a.id) });
  } catch (err) {
    console.error('Błąd analizy AI:', err);
    res.status(500).json({ error: 'Błąd analizy AI', details: err.message });
  }
}

// GET /ai/week-summary/:userId?date=2026-04-15
// Używa ZAPISANYCH analiz zamiast re-generować przez AI — spójne dane za każdym wejściem
async function weekSummaryHandler(req, res) {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    const notes = await returnNotesForWeek(userId, date);

    if (notes.length === 0) {
      return res.status(200).json({
        analysis: null,
        noteCount: 0,
        weekNotes: [],
      });
    }

    // Zbierz zapisane analizy z wpisów
    const notesWithAnalysis = notes.map(n => ({
      ...n,
      analysis: n.analysis_json ? JSON.parse(n.analysis_json) : null,
    }));

    // Uśrednij emocje z tygodnia na podstawie zapisanych analiz
    const analysedNotes = notesWithAnalysis.filter(n => n.analysis);
    let aggregatedAnalysis = null;

    if (analysedNotes.length > 0) {
      const avg = (field) =>
        Math.round(analysedNotes.reduce((s, n) => s + (n.analysis[field] || 0), 0) / analysedNotes.length);

      // Zlep nastroje: ostatni wpis jako główny + info o liczbie wpisów
      const lastNastroj = analysedNotes[0].analysis.nastroj;
      // Zbierz porady z ostatniego wpisu (najnowsze)
      const lastNote = notesWithAnalysis[0];
      const advices = lastNote ? await getAdviceForNote(lastNote.id) : [];

      aggregatedAnalysis = {
        nastroj: lastNastroj,
        szczescie: avg('szczescie'),
        smutek: avg('smutek'),
        stres: avg('stres'),
        zlosc: avg('zlosc'),
        porada1: advices[0] || null,
        porada2: advices[1] || null,
        porada3: advices[2] || null,
      };
    }

    // Jeśli brak zapisanych analiz (stare wpisy bez Analysis_json), wygeneruj świeżo
    if (!aggregatedAnalysis) {
      const [ineffective, effective] = await Promise.all([
        getIneffectiveAdvice(userId),
        getEffectiveAdvice(userId),
      ]);
      aggregatedAnalysis = await analyzeWeekSummary(notes, ineffective, effective);
    }

    res.status(200).json({
      analysis: aggregatedAnalysis,
      noteCount: notes.length,
      weekNotes: notesWithAnalysis,
    });
  } catch (err) {
    console.error('Błąd tygodnia AI:', err);
    res.status(500).json({ error: 'Błąd AI', details: err.message });
  }
}

// GET /ai/pending-advice/:userId?date=YYYY-MM-DD
async function getPendingAdviceHandler(req, res) {
  try {
    const { userId } = req.params;
    const { date } = req.query;
    const advices = await getPendingAdvice(userId, date);
    res.status(200).json(advices);
  } catch (err) {
    console.error('Błąd pobierania porad:', err);
    res.status(500).json({ error: 'Błąd bazy danych' });
  }
}

// POST /ai/advice-feedback
async function adviceFeedbackHandler(req, res) {
  try {
    const { adviceId, wasFollowed, issuePersists } = req.body;
    if (adviceId === undefined || wasFollowed === undefined) {
      return res.status(400).json({ error: 'Brak adviceId lub wasFollowed' });
    }
    const updated = await markAdviceFeedback(adviceId, wasFollowed, issuePersists ?? null);
    res.status(200).json(updated);
  } catch (err) {
    console.error('Błąd zapisu feedbacku:', err);
    res.status(500).json({ error: 'Błąd bazy danych' });
  }
}

module.exports = { analyzeNoteHandler, weekSummaryHandler, getPendingAdviceHandler, adviceFeedbackHandler };

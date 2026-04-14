const { analyzeNote, analyzeWeekSummary } = require('../services/AiService');
const { returnNotesForWeek } = require('../services/NoteService');

// POST /ai/analyze-note
// Body: { noteData: { content, ammout_sleep, ammout_of_water, nutrition_intake, date_added } }
async function analyzeNoteHandler(req, res) {
  try {
    const { noteData } = req.body;
    if (!noteData) {
      return res.status(400).json({ error: 'Brak danych wpisu (noteData)' });
    }
    const result = await analyzeNote(noteData);
    res.status(200).json(result);
  } catch (err) {
    console.error('Błąd analizy AI:', err);
    res.status(500).json({ error: 'Błąd analizy AI', details: err.message });
  }
}

// GET /ai/week-summary/:userId?date=2026-04-15
async function weekSummaryHandler(req, res) {
  try {
    const { userId } = req.params;
    const { date } = req.query;
    const notes = await returnNotesForWeek(userId, date);
    const result = await analyzeWeekSummary(notes);
    res.status(200).json({ analysis: result, noteCount: notes.length });
  } catch (err) {
    console.error('Błąd analizy tygodnia AI:', err);
    res.status(500).json({ error: 'Błąd analizy AI', details: err.message });
  }
}

module.exports = { analyzeNoteHandler, weekSummaryHandler };

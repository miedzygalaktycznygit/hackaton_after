const { pool } = require('../db/db_config');

// Zapisz porady AI po wpisie
async function saveAdvice(userId, noteId, advices) {
  // advices: [{text, category}]
  const saved = [];
  for (const adv of advices) {
    const res = await pool.query(
      `INSERT INTO AiAdvice (UserId, NoteId, AdviceText, Category)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, noteId, adv.text, adv.category || 'ogólne']
    );
    saved.push(res.rows[0]);
  }
  return saved;
}

// Pobierz porady oczekujące na ocenę z poprzednich dni (wzgl. podanej daty referencyjnej)
async function getPendingAdvice(userId, referenceDate) {
  const refDate = referenceDate ? new Date(referenceDate) : new Date();
  // Format YYYY-MM-DD
  const refDateStr = refDate.toISOString().split('T')[0];

  const res = await pool.query(
    `SELECT a.*, n.date_added as note_date
     FROM AiAdvice a
     JOIN Notes n ON n.Id = a.NoteId
     WHERE a.UserId = $1
       AND a.WasFollowed IS NULL
       AND DATE(n.date_added) < $2::date
     ORDER BY a.CreatedAt DESC
     LIMIT 10`,
    [userId, refDateStr]
  );
  return res.rows;
}

// Zapisz feedback użytkownika do porady, wyznacz skuteczność
// wasFollowed: czy użytkownik skorzystał z rady
// issuePersists: czy problem nadal się pojawia (z nowego wpisu)
async function markAdviceFeedback(adviceId, wasFollowed, issuePersists) {
  // Skuteczna = skorzystał I problem zniknął
  let wasEffective = null;
  if (wasFollowed !== null && issuePersists !== null) {
    wasEffective = wasFollowed && !issuePersists;
  }

  const res = await pool.query(
    `UPDATE AiAdvice SET WasFollowed = $1, WasEffective = $2
     WHERE Id = $3 RETURNING *`,
    [wasFollowed, wasEffective, adviceId]
  );
  return res.rows[0];
}

// Pobierz historię nieskutecznych porad dla AI (do kontekstu promptu)
async function getIneffectiveAdvice(userId, limit = 10) {
  const res = await pool.query(
    `SELECT AdviceText, Category FROM AiAdvice
     WHERE UserId = $1 AND WasEffective = false
     ORDER BY CreatedAt DESC LIMIT $2`,
    [userId, limit]
  );
  return res.rows;
}

// Pobierz historię skutecznych porad
async function getEffectiveAdvice(userId, limit = 10) {
  const res = await pool.query(
    `SELECT AdviceText, Category FROM AiAdvice
     WHERE UserId = $1 AND WasEffective = true
     ORDER BY CreatedAt DESC LIMIT $2`,
    [userId, limit]
  );
  return res.rows;
}

module.exports = { saveAdvice, getPendingAdvice, markAdviceFeedback, getIneffectiveAdvice, getEffectiveAdvice };

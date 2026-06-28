////Wysyłanie notatki do bazy
///Pobieranie notatki z bazy

///Wysyłanie podsumowania notatki przez chata do bazy
///Pobieranie podsumowania notatki z bazy
//Pobieranie podsumowania notatek z bazy z jakiegoś okresu czasu

//
const { pool } = require('../db/db_config')
const { generateEmbedding, cosineSimilarity } = require('./AiService');

async function addNote(userId, content, ammount_sleep, ammount_of_water, nutrition_intake, date_added) {
    try {
        const dateToUse = date_added ? new Date(date_added) : new Date();
        const result = await pool.query(
            `INSERT INTO Notes (UserId, Content, Ammout_sleep, Ammout_of_water, Nutrition_intake, Date_added)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [userId, content, ammount_sleep, ammount_of_water, nutrition_intake, dateToUse]
        );
        return result.rows[0];
    } catch (err) {
        console.error(err);
        throw new Error('Database error');
    }
}

// Zwraca wszystkie wpisy użytkownika z danego tygodnia (Pon-Nie)
async function returnNotesForWeek(userId, anyDateInWeek) {
    try {
        const d = anyDateInWeek ? new Date(anyDateInWeek) : new Date();
        // Oblicz poniedziałek i niedzielę tygodnia
        const day = d.getDay(); // 0=niedziela
        const diffToMon = day === 0 ? -6 : 1 - day;
        const monday = new Date(d);
        monday.setDate(d.getDate() + diffToMon);
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        const result = await pool.query(
            `SELECT * FROM Notes WHERE UserId = $1 AND Date_added BETWEEN $2 AND $3 ORDER BY Date_added DESC`,
            [userId, monday, sunday]
        );
        return result.rows;
    } catch (err) {
        console.error(err);
        throw new Error('Database error');
    }
}

async function returnNotes(userId) {
    try {
        const result = await pool.query(
            `SELECT * FROM Notes WHERE UserId = $1 ORDER BY Date_added DESC`,
            [userId]
        );
        return result.rows;
    }
    catch (err) {
        console.error(err); 
        throw new Error('Database error');
    }
}


// Zapisz wynik analizy AI do wpisu (raz, po generacji)
async function updateNoteAnalysis(noteId, analysisObj) {
    try {
        await pool.query(
            `UPDATE Notes SET Analysis_json = $1 WHERE Id = $2`,
            [JSON.stringify(analysisObj), noteId]
        );
    } catch (err) {
        console.error('updateNoteAnalysis error:', err);
    }
}

// Wszystkie wpisy użytkownika z paginacją
async function returnAllNotes(userId, limit = 15, offset = 0) {
    try {
        const result = await pool.query(
            `SELECT * FROM Notes WHERE UserId = $1 ORDER BY Date_added DESC LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        return result.rows;
    } catch (err) {
        console.error(err);
        throw new Error('Database error');
    }
}

// Zapisz wektor (embedding) do wpisu
async function updateNoteEmbedding(noteId, embedding) {
    try {
        await pool.query(
            `UPDATE Notes SET Embedding = $1 WHERE Id = $2`,
            [embedding, noteId]
        );
    } catch (err) {
        console.error('updateNoteEmbedding error:', err);
    }
}

// Wyszukiwanie semantyczne (Vector Similarity Search w pamięci RAM)
async function searchNotesSemantic(userId, queryText, limit = 5) {
    try {
        const queryVec = await generateEmbedding(queryText);
        
        // Pobierz wszystkie notatki użytkownika z zapisanym wektorem
        const result = await pool.query(
            `SELECT Id, UserId, Content, Ammout_sleep, Ammout_of_water, Nutrition_intake, Date_added, Analysis_json, Embedding
             FROM Notes WHERE UserId = $1 AND Embedding IS NOT NULL`,
            [userId]
        );
        
        const notes = result.rows;
        
        // Oblicz podobieństwo cosinusowe
        const scoredNotes = notes.map(note => {
            const score = cosineSimilarity(queryVec, note.Embedding || note.embedding);
            return {
                ...note,
                Embedding: undefined, // ukrywamy wektor przed frontendem
                embedding: undefined,
                score: parseFloat(score.toFixed(4))
            };
        });
        
        // Sortuj malejąco według dopasowania
        scoredNotes.sort((a, b) => b.score - a.score);
        
        return scoredNotes.slice(0, limit);
    } catch (err) {
        console.error('searchNotesSemantic error:', err);
        throw new Error('Database search error');
    }
}

module.exports = {
    addNote,
    returnNotes,
    returnNotesForWeek,
    updateNoteAnalysis,
    returnAllNotes,
    updateNoteEmbedding,
    searchNotesSemantic
};
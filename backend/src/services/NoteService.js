////Wysyłanie notatki do bazy
///Pobieranie notatki z bazy

///Wysyłanie podsumowania notatki przez chata do bazy
///Pobieranie podsumowania notatki z bazy
//Pobieranie podsumowania notatek z bazy z jakiegoś okresu czasu

//
const { pool } = require('../db/db_config')

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


module.exports = {addNote, returnNotes, returnNotesForWeek}
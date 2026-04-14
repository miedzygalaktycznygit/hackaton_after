////Wysyłanie notatki do bazy
///Pobieranie notatki z bazy

///Wysyłanie podsumowania notatki przez chata do bazy
///Pobieranie podsumowania notatki z bazy
//Pobieranie podsumowania notatek z bazy z jakiegoś okresu czasu

//
const { pool } = require('../db/db_config')
async function addNote(userId, content, ammount_sleep, ammount_of_water, nutrition_intake) {
    try {
        const result = await pool.query(
            `INSERT INTO Notes (UserId, Content, Ammout_sleep, Ammout_of_water, Nutrition_intake)
                VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [userId, content, ammount_sleep, ammount_of_water, nutrition_intake]
        );
        return result.rows[0];
    } catch (err) {
        console.error(err);
        throw new Error('Database error');
    }
}

async function returnNotes(userId) {
    try {
        const result = await pool.query(
            `SELECT * FROM Notes WHERE UserId = $1`,
            [userId]
        );
        return result.rows;
    }
    catch (err) {
        console.error(err); 
        throw new Error('Database error');
    }
}


module.exports = {addNote, returnNotes}
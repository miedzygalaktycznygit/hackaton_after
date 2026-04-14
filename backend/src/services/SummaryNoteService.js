const e = require('express');
const { pool } = require('../db/db_config')

async function addSummaryNote(NoteId, Summary, DailyMoodId) {
    try{
        const result = await pool.query(
            `INSERT INTO summary_note (Notes_Id, Summary, DailyMood_Id)
                VALUES ($1, $2, $3) RETURNING *`,
            [NoteId, Summary, DailyMoodId]
        );
        return result.rows[0];
    } catch (err) {
        console.error(err);
        throw new Error('Database error');
    }
}

async function returnSummaryNote(id) {
    try {
        const result = await pool.query(
            `SELECT * FROM Summary_note WHERE Id = $1`,
            [id]
        );
        return result.rows[0];
    } catch (err) {
        console.error(err);
        throw new Error('Database error');
    }
}

module.exports = {addSummaryNote, returnSummaryNote}
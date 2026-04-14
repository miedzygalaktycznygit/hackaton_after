const e = require('express');
const { pool } = require('../db/db_config')

async function addDailyMood(userId, happiness, saddnes, stress, anger) {
    try{
        const result = await pool.query(
            `INSERT INTO DailyMood (UserId, Happiness, Saddnes, Stress, Anger)
                VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [userId, happiness, saddnes, stress, anger]
        );
        return result.rows[0];
    } catch (err) {
        console.error(err);
        throw new Error('Database error');
    }
}

async function returnDailyMood(id) {
    try {
        const result = await pool.query(
            `SELECT * FROM DailyMood WHERE Id = $1`,
            [id]
        );
        return result.rows[0];
    } catch (err) {
        console.error(err);
        throw new Error('Database error');
    }
}

module.exports = {addDailyMood, returnDailyMood}
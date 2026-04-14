const { addNote, returnNotes, returnNotesForWeek } = require('../services/NoteService')

async function createNote(req, res) {
    const {userId, content, ammount_sleep, ammount_of_water, nutrition_intake, date_added} = req.body;
    try {
        await addNote(userId, content, ammount_sleep, ammount_of_water, nutrition_intake, date_added);
        res.status(201).json({ message: 'Note created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
}

async function getNotes(req, res) {
    const {userId} = req.params;
    try {
        const result = await returnNotes(userId);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
}

// GET /notes/week/:userId?date=2026-04-15
async function getNotesForWeek(req, res) {
    const {userId} = req.params;
    const { date } = req.query;
    try {
        const result = await returnNotesForWeek(userId, date);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
}

module.exports = { createNote, getNotes, getNotesForWeek }
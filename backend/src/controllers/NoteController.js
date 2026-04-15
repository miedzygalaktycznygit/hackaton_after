const { addNote, returnNotes, returnNotesForWeek, returnAllNotes } = require('../services/NoteService')

async function createNote(req, res) {
    const {userId, content, ammount_sleep, ammount_of_water, nutrition_intake, date_added} = req.body;
    try {
        const note = await addNote(userId, content, ammount_sleep, ammount_of_water, nutrition_intake, date_added);
        res.status(201).json({ message: 'Note created successfully', noteId: note.id });
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

// GET /notes/all/:userId?limit=15&offset=0
async function getAllNotes(req, res) {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 15;
    const offset = parseInt(req.query.offset) || 0;
    try {
        const result = await returnAllNotes(userId, limit, offset);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
}

module.exports = { createNote, getNotes, getNotesForWeek, getAllNotes }
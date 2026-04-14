

const { addNote, returnNotes } = require('../services/NoteService')

async function createNote(req, res) {
    const {userId, content, ammount_sleep, ammount_of_water, nutrition_intake} = req.body;
    try {
        await addNote(userId, content, ammount_sleep, ammount_of_water, nutrition_intake);
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

        

module.exports = { createNote, getNotes }
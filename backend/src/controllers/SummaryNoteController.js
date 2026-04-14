const {addSummaryNote, returnSummaryNote} = require('../services/SummaryNoteService')

async function createSummaryNote(req, res) {
    const {NoteId, Summary, DailyMoodId} = req.body;
    try {
        const result = await addSummaryNote(NoteId, Summary, DailyMoodId);
        res.status(201).json({ message: 'Summary note created successfully', data: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
}

async function getSummaryNote(req, res) {
    try{ 
        const {id} = req.params;
        const result = await returnSummaryNote(id);
        if(!result){
            res.status(404).json({ error: 'Summary note not found' });
        } else {
            res.status(200).json({ data: result });
        }
        return result;
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
}

module.exports = { createSummaryNote, getSummaryNote }
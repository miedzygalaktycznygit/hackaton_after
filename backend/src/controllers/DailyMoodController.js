const {addDailyMood, returnDailyMood} = require('../services/DailyMoodService')

async function createDailyMood(req, res) {
    const {userId, happiness, saddnes, stress, anger} = req.body;
    try {
        const result = await addDailyMood(userId, happiness, saddnes, stress, anger);
        res.status(201).json({ message: 'Daily mood created successfully', data: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
}

async function getDailyMood(req, res) {
    try{ 
        const {id} = req.params;
        const result = await returnDailyMood(id);
        if(!result){
            res.status(404).json({ error: 'Daily mood not found' });
        } else {
            res.status(200).json({ data: result });
        }
        return result;
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
}

module.exports = { createDailyMood, getDailyMood }
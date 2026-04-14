const express = require('express');
const { analyzeNoteHandler, weekSummaryHandler } = require('../controllers/AiController');

const AiRouter = express.Router();

AiRouter.post('/analyze-note', analyzeNoteHandler);

AiRouter.get('/week-summary/:userId', weekSummaryHandler);

module.exports = AiRouter;

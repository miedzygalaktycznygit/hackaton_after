const express = require('express');
const { analyzeNoteHandler, weekSummaryHandler, getPendingAdviceHandler, adviceFeedbackHandler } = require('../controllers/AiController');

const AiRouter = express.Router();

AiRouter.post('/analyze-note', analyzeNoteHandler);
AiRouter.get('/week-summary/:userId', weekSummaryHandler);
AiRouter.get('/pending-advice/:userId', getPendingAdviceHandler);
AiRouter.post('/advice-feedback', adviceFeedbackHandler);

module.exports = AiRouter;

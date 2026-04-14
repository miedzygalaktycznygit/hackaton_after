const express = require('express')
const {createSummaryNote, getSummaryNote} = require("../controllers/SummaryNoteController")

const SummaryNoteRouter = express.Router()



SummaryNoteRouter.post("/create", createSummaryNote)
SummaryNoteRouter.get("/:id", getSummaryNote)

module.exports = SummaryNoteRouter
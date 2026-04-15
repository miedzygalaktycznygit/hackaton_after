const express = require('express')
const {createNote, getNotes, getNotesForWeek, getAllNotes} = require("../controllers/NoteController")

const NoteRouter = express.Router()

NoteRouter.post("/create", createNote)
NoteRouter.get("/week/:userId", getNotesForWeek)
NoteRouter.get("/all/:userId", getAllNotes)
NoteRouter.get("/:userId", getNotes)

module.exports = NoteRouter
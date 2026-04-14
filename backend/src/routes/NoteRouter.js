const express = require('express')
const {createNote, getNotes} = require("../controllers/NoteController")

const NoteRouter = express.Router()



NoteRouter.post("/create", createNote)
NoteRouter.get("/:userId", getNotes)

module.exports = NoteRouter
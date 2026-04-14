const express = require('express')
const DailyMoodRouter = express.Router()

const {createDailyMood, getDailyMood} = require("../controllers/DailyMoodController")


DailyMoodRouter.post("/create", createDailyMood)
DailyMoodRouter.get("/:id", getDailyMood)

module.exports = DailyMoodRouter
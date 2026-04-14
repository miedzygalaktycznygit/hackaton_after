const OpenAi = require("openai");
const express = require('express')
const { InitDb } = require("./src/db/db_init")
const NoteRouter = require("./src/routes/NoteRouter")
const DailyMoodRouter = require("./src/routes/DailyMoodRouter")
const SummaryNoteRouter = require("./src/routes/SummaryNoteRouter")
const AiRouter = require("./src/routes/AiRouter")
const cors = require('cors');

const app = express()
app.use(express.json())
const corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));
app.use("/notes", NoteRouter)
app.use("/daily-mood", DailyMoodRouter)
app.use("/summary-note", SummaryNoteRouter)
app.use("/ai", AiRouter)



const port = 3000

const BASE_URL = "http://engine.kin.tu.kielce.pl:32597/v1"
const API_KEY = 'sk-WbVjon5KgudCD0YdT-M-_A'
const LLM_MODELS = ['bielik', 'gemma4:small', 'gemma4:large']

const EMB_MODEL = "stella-embeddings"
const RERANK_MODEL = "polish-reranker"

const client = OpenAi({
  apiKey: API_KEY,
  baseURL: BASE_URL
});



app.get('/', async (req, res) => {
  const completion = await client.chat.completions.create({
    model: LLM_MODELS[0],
    messages: [{ "role": "user", "content": "Wypowiedź pacjenta: Dzisiaj wygrałem hackathon, jestem koksem. W jakim nastroju jest pacjent? Jakie masz rekomendacje dla niego. Napisz procentowo ile szczęscia odczuwa, smutku i stresu" }],
  });
  res.send(completion.choices[0].message.content)
})

app.listen(3000, "0.0.0.0", () => {
  console.log(`Server running on port 3000`);
  InitDb();
});
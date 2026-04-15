const {pool} = require("./db_config")


async function InitDb(){
    await pool.query(`CREATE TABLE IF NOT EXISTS "User" (
        Id SERIAL PRIMARY KEY,
        Name VARCHAR(100),
        Surname VARCHAR(100)
    );`)

    await pool.query(`
        CREATE TABLE IF NOT EXISTS Notes (
            Id SERIAL PRIMARY KEY,
            UserId INTEGER REFERENCES "User"(Id) ON DELETE CASCADE,
            Content TEXT,
            Ammout_sleep NUMERIC(4,1),
            Ammout_of_water NUMERIC(4,1),
            Nutrition_intake VARCHAR(255),
            Date_added TIMESTAMP DEFAULT NOW()
        );`
    )

    // Bezpieczne dodanie kolumn dla już istniejących baz danych
    await pool.query(`ALTER TABLE Notes ADD COLUMN IF NOT EXISTS Date_added TIMESTAMP DEFAULT NOW();`)
    await pool.query(`ALTER TABLE Notes ADD COLUMN IF NOT EXISTS Analysis_json TEXT;`)

    await pool.query(`
        CREATE TABLE IF NOT EXISTS DailyMood (
        Id SERIAL PRIMARY KEY,
        UserId INTEGER REFERENCES "User"(Id) ON DELETE CASCADE,
        happiness INTEGER,
        saddnes INTEGER,
        Stress INTEGER,
        Anger INTEGER);`)

    await pool.query(`CREATE TABLE IF NOT EXISTS Summary_note (
        Id SERIAL PRIMARY KEY,
        Notes_Id INTEGER REFERENCES Notes(Id) ON DELETE CASCADE,
        Summary TEXT,
        DailyMood_Id INTEGER REFERENCES DailyMood(Id) ON DELETE SET NULL
    );`)

    await pool.query(`CREATE TABLE IF NOT EXISTS AiAdvice (
        Id SERIAL PRIMARY KEY,
        UserId INTEGER REFERENCES "User"(Id) ON DELETE CASCADE,
        NoteId INTEGER REFERENCES Notes(Id) ON DELETE CASCADE,
        AdviceText TEXT NOT NULL,
        Category VARCHAR(100),
        WasFollowed BOOLEAN DEFAULT NULL,
        WasEffective BOOLEAN DEFAULT NULL,
        CreatedAt TIMESTAMP DEFAULT NOW()
    );`)
}

module.exports = {InitDb}
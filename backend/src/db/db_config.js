const {Pool} = require("pg")
require("dotenv").config()

const pool = new Pool({
    host:process.env.dbHost,
    port:parseInt(process.env.dbPort),
    user:process.env.dbUser,
    password:process.env.dbPassword,
    database:process.env.dbName

})

async function connectDb()
{
    if(await pool.connect()) console.log("Database conected succesfuly")
    
}


module.exports = {pool, connectDb}
const {Pool} = require('pg')
const path = require('path')
const dbDotenv = require('dotenv')

dbDotenv.config({ path: path.join(__dirname, '../.env') })

const pool=new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: String(process.env.DB_PASSWORD),
    database: process.env.DB_NAME
})

module.exports = {
    query: (text, params) => pool.query(text, params)
}

pool.connect().then(() => console.log("Database connected"))
const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

dotenv.config()

const app = express()

// Middleware
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

// Static paths for different sections
const mainPath = path.join(__dirname, 'public', 'main')
const registrationPath = path.join(__dirname, 'public', 'register')
const authorizationPath = path.join(__dirname, 'public', 'login')

app.use('/', express.static(mainPath))
app.use('/register', express.static(registrationPath))
app.use('/login', express.static(authorizationPath))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

module.exports = app
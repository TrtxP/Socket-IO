const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

dotenv.config()

const app = express()

const rootDir = path.join(__dirname, '..')

// Middleware
app.use(express.static(path.join(rootDir, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

// Static paths for different sections
const mainPath = path.join(rootDir, 'public', 'main')
const registrationPath = path.join(rootDir, 'public', 'register')
const authorizationPath = path.join(rootDir, 'public', 'login')

app.use('/', express.static(mainPath))
app.use('/register', express.static(registrationPath))
app.use('/login', express.static(authorizationPath))

app.set('views', path.join(rootDir, 'views'))
app.set('view engine', 'ejs')

module.exports = app
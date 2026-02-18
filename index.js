const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const path = require('path')

const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

const db = require('./database/db')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const cookie = require('cookie')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

dotenv.config()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))

const mainPath = path.join(__dirname, 'public', 'main')
const registrationPath = path.join(__dirname, 'registration')
const authorizationPath = path.join(__dirname, 'authorization')

// app.use('/', express.static(mainPath))
app.use('/register', express.static(registrationPath))
app.use('/login', express.static(authorizationPath))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.sendFile(path.join(mainPath, 'main.html'))
})

app.get('/chat', (req, res) => {
    res.render('index')
})

app.get('/register', (req, res) => {
    res.sendFile(path.join(registrationPath, 'index.html'))
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(authorizationPath, 'index.html'))
})

app.post('/register', async (req, res) => {
    const { username, password, repeatPass } = req.body

    if (password !== repeatPass) {
        return res.status(401).send("The passwords don't match")
    }

    let saltRounds = 10

    let hashedPass = await bcrypt.hash(password, saltRounds)

    try {
        const result = await db.query(`
            INSERT INTO users (username, password) 
            VALUES ($1, $2) 
            RETURNING *`, 
            [username, hashedPass])
        
        res.send('Success')

        io.emit('user_registered', { username: result.rows[0].username })
    } catch (err) {
        console.log(`Error DB: ${err.message}`)
        res.status(500).send('Error registration')
    }
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body

    try {
        const result = await db.query(`
            SELECT * FROM users
            WHERE username = $1`,
            [username])
        
        const user = result.rows[0]

        if (!user) {
            return res.status(401).send('User not found')
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).send('Invalid password')
        }

        let jwtSecretKey = process.env.JWT_SECRET_KEY
        let data = {
            id: user.id,
            username: user.username
        }

        let token = jwt.sign(data, jwtSecretKey, { expiresIn: '24h' })
        
        res.cookie('token', token, { httpOnly: true })
        res.redirect('/')

        io.emit('user_authorized', { username: user.username })
    } catch (err) {
        res.status(500).send('Error authorization')
    }
})

const rooms = new Set(['general', 'random'])

app.get('/chat/:room', (req, res) => {
    const room = req.params.room

    if (rooms.has(room)) {
        res.render('index')
    } else {
        return res.redirect('/chat')
    }
})

io.use((socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '')
    const token = cookies.token
    let jwtSecretKey = process.env.JWT_SECRET_KEY

    if (!token) {
        return next(new Error('Authentication error: Token-missing'))
    }

    try {
        const decoded = jwt.verify(token, jwtSecretKey)
        socket.user = decoded
        next()
    } catch (error) {
        next (new Error('Authentication error: Invalid token'))
    }
})

io.on('connection', (socket) => {
    console.log(`Authenticated user connected: ${socket.user.username}`)

    socket.user = socket.user.username

    socket.emit('init rooms', Array.from(rooms))

    socket.on('join room', (room) => {
        socket.rooms.forEach(r => {
            if (r !== socket.id) {
                socket.leave(r)
                socket.emit('left room', r)
            }
        })

        socket.join(room)
        socket.emit('joined room', room)

        // socket.to(room).emit('room message', {
        //     username: 'System',
        //     message: `${socket.username} has joined the room`,
        //     timestamp: new Date().toISOString()
        // })
    })

    socket.on('create room', (roomName) => {
        if (!rooms.has(roomName)) {
            rooms.add(roomName)
            io.emit('room created', roomName)
        }
    })

    socket.on('chat message', (msg) => {
        const room = Array.from(socket.rooms).find(r => r !== socket.id) || 'general'
        io.to(room).emit('chat message', {
            username: socket.user,
            message: msg,
            timestamp: new Date().toISOString(),
            room: room
        })
    })

    // socket.on('set username', (username) => {
    //     let oldUsername = socket.username
    //     socket.username = username || 'Anonymous'
    //     io.emit('user joined', {
    //         oldUsername: oldUsername,
    //         newUsername: socket.username
    //     })
    // })

    socket.on('disconnect', () => {
        console.log('A user disconnected')
        io.emit('user left', { username: socket.user })
    })
})

const PORT = process.env.PORT || 5500

server.listen(PORT, () => {
    console.log(`Server running on URL: http://localhost:${PORT}`)
})
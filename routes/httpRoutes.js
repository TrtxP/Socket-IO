const path = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../database/db')
const { rooms } = require('../utils/rooms')

module.exports = (app, io) => {
  // GET routes
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'public', 'main', 'main.html'))
  })

  app.get('/chat', (req, res) => {
    res.render('index')
  })

  app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'public', 'register', 'register.html'))
  })

  app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'public', 'login', 'login.html'))
  })

  // POST routes
  app.post('/register', async (req, res) => {
    const { username, password, repeatPass } = req.body

    if (!username || !password || !repeatPass) {
      return res.status(401).send("Data isn't filled in")
    }

    const dbQuery = await db.query(`
        SELECT * FROM users
        WHERE username = $1`,
        [username])

    const user = dbQuery.rows[0]

    if (user) {
      return res.status(401).send(`User ${user.username} is already existed`)
    }

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

      res.redirect('/')

      io.emit('user_registered', { username: result.rows[0].username })

    } catch (err) {
      console.log(`Error DB: ${err.message}`)
      res.status(500).send('Error registration')
    }
  })

  app.post('/login', async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(401).send("Data isn't filled in")
    }

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

  // Chat room route
  app.get('/chat/:room', (req, res) => {
    const room = req.params.room

    if (room && !rooms.has(room)) {
      return res.redirect('/chat')
    }

    res.render('index', { currentRoom: room || 'general' })
  })
}
const cookie = require('cookie')
const jwt = require('jsonwebtoken')
const db = require('../database/db')
const { rooms } = require('../utils/rooms')

module.exports = (io) => {
  // Authentication middleware for socket.io
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
      next(new Error('Authentication error: Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`Authenticated user connected: ${socket.user.username}`)

    // Set the user property on the socket to the username for easy access
    socket.user = socket.user.username

    // Send the list of rooms to the newly connected user
    socket.emit('init rooms', Array.from(rooms))

    socket.on('join room', async (room) => {
      // Leave all rooms except the socket's own ID
      socket.rooms.forEach(r => {
        if (r !== socket.id) {
          socket.leave(r)
        }
      })

      socket.join(room)

      try {
        const result = await db.query(`
            SELECT * FROM (
                SELECT username, message, created_at
                FROM messages
                WHERE room = $1
                ORDER BY created_at DESC
                LIMIT 50
                ) AS recent_messages
                ORDER BY created_at ASC;`, [room])

        socket.emit('load history', result.rows)

        // Notify the room that the user has joined
        socket.to(room).emit('room message', {
          username: 'System',
          message: `${socket.user} join the room`,
          timestamp: new Date().toISOString()
        })

      } catch (error) {
        console.error('Error joining room:', error)
      }
    })

    socket.on('create room', (roomName) => {
      if (!rooms.has(roomName)) {
        rooms.add(roomName)
        io.emit('room created', roomName)
      }
    })

    socket.on('chat message', async (msg) => {
      const room = Array.from(socket.rooms).find(r => r !== socket.id) || 'general'
      const user = socket.user
      try {
        await db.query(`
            INSERT INTO messages (room, username, message)
            VALUES ($1, $2, $3)`,
            [room, user, msg])

        io.to(room).emit('chat message', {
          username: socket.user,
          message: msg,
          timestamp: new Date().toISOString(),
          room: room
        })
      } catch (error) {
        console.error('Error sending message:', error)
      }
    })

    socket.on('disconnect', () => {
      console.log('A user disconnected')
      io.emit('user left', { username: socket.user })
    })
  })
}
const cookie = require('cookie')
const jwt = require('jsonwebtoken')
const db = require('../database/db')
const { rooms } = require('../utils/rooms')
const typingEvents = require('./typingEvents')
const userPresence = require('./userPresence')

module.exports = (io) => {
  // Initialize typing events
  const typingState = typingEvents(io)
  // Initialize user presence tracking
  const presenceState = userPresence(io)
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
      // Let userPresence handle the room joining logic
      // Emit the join room event to userPresence module
      socket.emit('join room', room)
    })

    socket.on('create room', (roomName) => {
      if (!rooms.has(roomName)) {
        rooms.add(roomName)
        io.emit('room created', roomName)
      }
      // Auto-join the created room (handled by userPresence)
      socket.emit('join room', roomName)
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
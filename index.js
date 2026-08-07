const appSetup = require('./config/appSetup')
const http = require('http')
const { Server } = require('socket.io')

// Setup Express app
const app = appSetup

// Create HTTP server and attach Socket.io
const server = http.createServer(app)
const io = new Server(server)

// Setup HTTP routes
require('./routes/httpRoutes')(app, io)

// Setup Socket.io events
require('./sockets/socketEvents')(io)

const PORT = process.env.PORT || 5500

server.listen(PORT, () => {
  console.log(`Server running on URL: http://localhost:${PORT}`)
})
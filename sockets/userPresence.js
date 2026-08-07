// User presence tracking functionality
module.exports = (io) => {
  const db = require('../database/db')
  const { rooms } = require('../utils/rooms')

  // Map to track users per room
  const roomUsers = new Map(); // room -> Set of usernames
  // Map to track which rooms each user is in (for efficient cleanup)
  const userRooms = new Map(); // username -> Set of rooms

  // Handle user presence events
  io.on('connection', (socket) => {
    const username = socket.user;

    // Initialize user's room tracking
    if (!userRooms.has(username)) {
      userRooms.set(username, new Set());
    }

    // When user joins a room
    socket.on('join room', async (room) => {
      // Leave all rooms except the socket's own ID (existing logic)
      socket.rooms.forEach(r => {
        if (r !== socket.id) {
          socket.leave(r);
        }
      });

      socket.join(room);

      // Update user presence tracking
      const userRoomsSet = userRooms.get(username);
      userRoomsSet.add(room);

      // Initialize room users set if not exists
      if (!roomUsers.has(room)) {
        roomUsers.set(room, new Set());
      }
      const usersInRoom = roomUsers.get(room);
      usersInRoom.add(username);

      // Notify room about updated user list
      io.to(room).emit('user list update', {
        room,
        users: Array.from(usersInRoom)
      });

      // Also send to the joiner (in case they need it immediately)
      socket.emit('user list update', {
        room,
        users: Array.from(usersInRoom)
      });

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
    });

    // When user creates a room (also joins it)
    socket.on('create room', (roomName) => {
      if (!rooms.has(roomName)) {
        rooms.add(roomName)
        io.emit('room created', roomName)
      }
      // Auto-join the created room
      socket.emit('join room', roomName);
    });

    // Clean up when user disconnects
    socket.on('disconnect', () => {
      // Remove user from all rooms they were in
      const userRoomsSet = userRooms.get(username);
      if (userRoomsSet) {
        userRoomsSet.forEach((room) => {
          // Remove user from room's user list
          const usersInRoom = roomUsers.get(room);
          if (usersInRoom) {
            usersInRoom.delete(username);

            // Notify room about updated user list
            io.to(room).emit('user list update', {
              room,
              users: Array.from(usersInRoom)
            });

            // Notify room that user left
            socket.to(room).emit('room message', {
              username: 'System',
              message: `${socket.user} left the room`,
              timestamp: new Date().toISOString()
            });
          }
        });
        userRoomsSet.clear();
      }

      // Clean up user tracking
      userRooms.delete(username);

      // Emit global user left event (existing functionality)
      io.emit('user left', { username: socket.user });
    });
  });

  // Optional: Expose tracking maps for debugging/admin purposes
  return { roomUsers, userRooms };
};
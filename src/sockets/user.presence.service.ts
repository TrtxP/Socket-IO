// User presence tracking functionality
import { DatabaseService } from '../database/db.service';
import { rooms } from '../utils/rooms';
import type { Server, Socket } from 'socket.io';

export default function userPresence(io: Server) {
  const databaseService = new DatabaseService();

  // Map to track users per room
  const roomUsers = new Map<string, Set<string>>(); // room -> Set of usernames
  // Map to track which rooms each user is in (for efficient cleanup)
  const userRooms = new Map<string, Set<string>>(); // username -> Set of rooms

  // Handle user presence events
  io.on('connection', (socket: Socket) => {
    const username = (socket as any).user as string;

    // Initialize user's room tracking
    if (!userRooms.has(username)) {
      userRooms.set(username, new Set());
    }

    // When user joins a room
    socket.on('join room', async (room: string) => {
      // Leave all rooms except the socket's own ID (existing logic)
      socket.rooms.forEach((r: string) => {
        if (r !== socket.id) {
          socket.leave(r);
        }
      });

      socket.join(room);

      // Update user presence tracking
      const userRoomsSet = userRooms.get(username);
      if (userRoomsSet) {
        userRoomsSet.add(room);
      }

      // Initialize room users set if not exists
      if (!roomUsers.has(room)) {
        roomUsers.set(room, new Set());
      }
      const usersInRoom = roomUsers.get(room);
      if (usersInRoom) {
        usersInRoom.add(username);
      }

      // Notify room about updated user list
      io.to(room).emit('user list update', {
        room,
        users: Array.from(usersInRoom || [])
      });

      // Also send to the joiner (in case they need it immediately)
      socket.emit('user list update', {
        room,
        users: Array.from(usersInRoom || [])
      });

      try {
        const result = await databaseService.query(
          `SELECT * FROM (
              SELECT username, message, created_at
              FROM messages
              WHERE room = $1
              ORDER BY created_at DESC
              LIMIT 50
            ) AS recent_messages
            ORDER BY created_at ASC;`, [room]
        );

        socket.emit('load history', result.rows);

        // Notify the room that the user has joined
        socket.to(room).emit('room message', {
          username: 'System',
          message: `${(socket as any).user} join the room`,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error joining room:', error);
      }
    });

    // When user creates a room (also joins it)
    socket.on('create room', (roomName: string) => {
      if (!rooms.has(roomName)) {
        rooms.add(roomName);
        io.emit('room created', roomName);
      }
      // Auto-join the created room
      socket.emit('join room', roomName);
    });

    // Clean up when user disconnects
    socket.on('disconnect', () => {
      // Remove user from all rooms they were in
      const userRoomsSet = userRooms.get(username);
      if (userRoomsSet) {
        userRoomsSet.forEach((room: string) => {
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
              message: `${(socket as any).user} left the room`,
              timestamp: new Date().toISOString()
            });
          }
        });
        userRoomsSet.clear();
      }

      // Clean up user tracking
      userRooms.delete(username);

      // Emit global user left event (existing functionality)
      io.emit('user left', { username: (socket as any).user });
    });
  });

  // Optional: Expose tracking maps for debugging/admin purposes
  return { roomUsers, userRooms };
}
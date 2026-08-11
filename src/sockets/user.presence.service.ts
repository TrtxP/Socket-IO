// User presence tracking functionality
import { DatabaseService } from '../database/db.service';
import { MessagesService } from '../messages/messages.service';
import { rooms } from '../utils/rooms';
import type { Server, Socket } from 'socket.io';

import { Injectable } from '@nestjs/common';

@Injectable()
export class UserPresenceService {
  // Map to track users per room
  public roomUsers = new Map<string, Set<string>>(); // room -> Set of usernames
  // Map to track which rooms each user is in (for efficient cleanup)
  public userRooms = new Map<string, Set<string>>(); // username -> Set of rooms

  constructor(
    private readonly messagesService: MessagesService
  ) { }

  setupEvents(io: Server) {
    // Handle user presence events
    io.on('connection', (socket: Socket) => {
      const username = (socket as any).user?.username || 'Unknown';

      // Initialize user's room tracking
      if (!this.userRooms.has(username)) {
        this.userRooms.set(username, new Set());
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
        const userRoomsSet = this.userRooms.get(username);
        if (userRoomsSet) {
          userRoomsSet.add(room);
        }

        // Initialize room users set if not exists
        if (!this.roomUsers.has(room)) {
          this.roomUsers.set(room, new Set());
        }
        const usersInRoom = this.roomUsers.get(room);
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
          const history = await this.messagesService.getMessageHistoryPaginated(room, 100, 0);

          socket.emit('load history', history);

          // Notify the room that the user has joined
          socket.to(room).emit('room message', {
            username: 'System',
            message: `${username} joined the room`,
            timestamp: new Date().toISOString()
          });

        } catch (error) {
          console.error('Error joining room:', error);
        }
      });

      // Load more messages (pagination)
      socket.on('load more', async (data: { room: string, offset: number }) => {
        try {
          const olderMessages = await this.messagesService.getMessageHistoryPaginated(
            data.room, 100, data.offset
          );
          socket.emit('load more history', olderMessages);
        } catch (error) {
          console.error('Error loading more messages:', error);
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
        const userRoomsSet = this.userRooms.get(username);
        if (userRoomsSet) {
          userRoomsSet.forEach((room: string) => {
            // Remove user from room's user list
            const usersInRoom = this.roomUsers.get(room);
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
                message: `${username} left the room`,
                timestamp: new Date().toISOString()
              });
            }
          });
          userRoomsSet.clear();
        }

        // Clean up user tracking
        this.userRooms.delete(username);

        // Emit global user left event (existing functionality)
        io.emit('user left', { username });
      });
    });
  }
}
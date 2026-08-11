import typingEvents from './typing.events.service';
import { UserPresenceService } from './user.presence.service';
import { MessagesService } from '../messages/messages.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class SocketIoService {
  constructor(
    private messagesService: MessagesService,
    private userPresenceService: UserPresenceService
  ) {}

  setupEvents(io) {
    // Initialize sub-modules
    typingEvents(io);
    this.userPresenceService.setupEvents(io);

    io.on('connection', (socket) => {
      console.log(`Authenticated user connected: ${(socket as any).user.username}`);

      // Set the user property on the socket to the username for easy access
      socket.user = (socket as any).user.username as string;
      socket.emit('session', { username: socket.user });

      // Send the list of rooms to the newly connected user
      // We'll get rooms from utils/rooms.js
      const { rooms } = require('../utils/rooms');
      socket.emit('init rooms', Array.from(rooms));

      // 'join room' and 'create room' are handled by user.presence.service

      socket.on('chat message', async (msg) => {
        const room = (Array.from(socket.rooms).find(r => r !== socket.id) || 'general') as string;
        const user = socket.user as string;
        try {
          await this.messagesService.saveMessage(room, user, msg as string);

          io.to(room).emit('chat message', {
            username: user,
            message: msg as string,
            timestamp: new Date().toISOString(),
            room: room
          });
        } catch (error) {
          console.error('Error sending message:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('A user disconnected');
        io.emit('user left', { username: socket.user });
      });
    });
  }
}
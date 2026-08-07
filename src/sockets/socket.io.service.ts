import typingEvents from './typing.events.service';
import userPresence from './user.presence.service';
import { MessagesService } from '../messages/messages.service';

export default class SocketIoService {
  constructor(private messagesService: MessagesService) {}

  setupEvents(io) {
    // Initialize sub-modules
    typingEvents(io);
    userPresence(io);

    io.on('connection', (socket) => {
      console.log(`Authenticated user connected: ${(socket as any).user.username}`);

      // Set the user property on the socket to the username for easy access
      socket.user = (socket as any).user.username as string;

      // Send the list of rooms to the newly connected user
      // We'll get rooms from utils/rooms.js
      const { rooms } = require('../utils/rooms');
      socket.emit('init rooms', Array.from(rooms));

      socket.on('join room', async (room: string) => {
        // Let userPresence handle the room joining logic
        // Emit the join room event to userPresence module
        socket.emit('join room', room);
      });

      socket.on('create room', (roomName) => {
        if (!rooms.has(roomName)) {
          rooms.add(roomName);
          io.emit('room created', roomName);
        }
        // Auto-join the created room (handled by userPresence)
        socket.emit('join room', roomName);
      });

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
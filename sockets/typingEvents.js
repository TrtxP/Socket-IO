// Typing indicators functionality
module.exports = (io) => {
  // Map to track typing users per room
  const typingUsers = new Map(); // room -> Set of usernames

  // Handle typing events
  io.on('connection', (socket) => {
    // When user starts typing
    socket.on('typing', (data) => {
      const { room, isTyping } = data;
      const username = socket.user;

      // Initialize room set if not exists
      if (!typingUsers.has(room)) {
        typingUsers.set(room, new Set());
      }

      const usersTyping = typingUsers.get(room);

      if (isTyping) {
        usersTyping.add(username);
      } else {
        usersTyping.delete(username);
      }

      // Notify others in the room about typing status
      // Exclude the sender to prevent self-notification
      socket.to(room).emit('typing update', {
        room,
        users: Array.from(usersTyping),
        currentUserTyping: isTyping,
        username
      });
    });

    // Clean up when user disconnects
    socket.on('disconnect', () => {
      const username = socket.user;
      // Remove user from all typing maps
      typingUsers.forEach((usersTyping, room) => {
        usersTyping.delete(username);
        // Notify room that user stopped typing
        socket.to(room).emit('typing update', {
          room,
          users: Array.from(usersTyping),
          currentUserTyping: false,
          username
        });
      });
    });
  });

  // Optional: Expose typingUsers for debugging/admin purposes
  return { typingUsers };
};
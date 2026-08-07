# 💬 Socket.IO Chat Application

A real-time chat application built with Node.js, NestJS (using Fastify adapter), and Socket.IO.

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</div>

---

## ✨ Features

- Create and manage chat rooms
- Switch between different chats effortlessly
- User registration and login forms
- Secure authentication and authorization for chat users
- Persistent user data storage in PostgreSQL
- Password hashing with bcrypt for better security
- Real-time communication using Socket.IO

---

## 🧩 Tech Stack

- Node.js
- NestJS (with Fastify adapter)
- Socket.IO
- PostgreSQL
- bcrypt

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/TrtxP/Socket-IO
cd Socket-IO
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file from the existing `.env.example` file and update the values for your local setup:

```bash
cp .env.example .env
```

Example `.env` configuration:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=socketio_chat
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret
```

Make sure PostgreSQL is running and the credentials match your local database configuration.

### 4. Run the application

```bash
npm start
```

---

## 📌 Notes

Make sure PostgreSQL is configured correctly and the required environment variables are set before starting the server.

---

## 🎯 Project Goal

This project demonstrates a lightweight real-time chat system with user management, room-based conversations, and secure user authentication.

## 📁 Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── config/                 # Configuration modules
├── auth/                   # Authentication module
│   ├── auth.controller.ts  # Auth controllers
│   ├── auth.service.ts     # Auth business logic
│   └── auth.module.ts      # Auth module
├── users/                  # User management
├── messages/               # Message handling
├── chat/                   # Chat room controllers
├── database/               # Database service
├── sockets/                # Socket.IO and real-time features
│   ├── socket.io.service.ts # Socket.IO setup
│   ├── socket.auth.middleware.ts # Socket auth middleware
│   ├── user.presence.service.ts # User presence tracking
│   └── typing.events.service.ts # Typing indicators
├── utils/                  # Utility functions
└── views/                  # EJS templates

public/                     # Static assets
├── main/                   # Main chat interface
├── register/               # Registration page
└── login/                  # Login page
```

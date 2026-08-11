import * as dotenv from 'dotenv';
import { join } from 'path';
dotenv.config({ path: join(__dirname, '..', '.env') });

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import fastifyCookie from 'fastify-cookie';
import { SocketAuthMiddleware } from './sockets/socket.auth.middleware';
import SocketIoService from './sockets/socket.io.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  // Register fastify-cookie
  app.register(fastifyCookie);

  // Serve static assets via Fastify
  app.useStaticAssets({
    root: join(__dirname, 'css'),
    prefix: '/css/',
  });
  app.useStaticAssets({
    root: join(__dirname, 'js'),
    prefix: '/js/',
    decorateReply: false,
  });
  app.useStaticAssets({
    root: join(__dirname, 'login'),
    prefix: '/login/',
    decorateReply: false,
  });
  app.useStaticAssets({
    root: join(__dirname, 'register'),
    prefix: '/register/',
    decorateReply: false,
  });
  app.useStaticAssets({
    root: join(__dirname, 'reset-password'),
    prefix: '/reset-password/',
    decorateReply: false,
  });

  await app.init();

  // Get underlying Fastify instance
  const fastifyInstance = app.getHttpAdapter().getInstance();

  // Get the raw HTTP server from Fastify instance
  const httpServer = fastifyInstance.server;

  // Initialize Socket.io server
  const { Server } = require('socket.io');
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
      credentials: true
    },
    allowEIO3: true
  });

  // Apply Socket.io authentication middleware
  const socketAuthMiddleware = app.get(SocketAuthMiddleware);
  io.use((socket, next) => socketAuthMiddleware.use(socket, next));

  // Set up Socket.io events (moved to SocketIoService)
  const socketIoService = app.get(SocketIoService);
  socketIoService.setupEvents(io);

  await app.listen(process.env.PORT || 5500);
}
bootstrap();
import { Module } from '@nestjs/common';
import SocketIoService from './socket.io.service';
import { SocketAuthMiddleware } from './socket.auth.middleware';
import { MessagesModule } from '../messages/messages.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MessagesModule, AuthModule],
  providers: [SocketIoService, SocketAuthMiddleware],
  exports: [SocketIoService, SocketAuthMiddleware]
})
export class SocketsModule {}
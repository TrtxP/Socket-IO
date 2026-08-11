import { Module } from '@nestjs/common';
import SocketIoService from './socket.io.service';
import { SocketAuthMiddleware } from './socket.auth.middleware';
import { MessagesModule } from '../messages/messages.module';
import { AuthModule } from '../auth/auth.module';
import { UserPresenceService } from './user.presence.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [MessagesModule, AuthModule, DatabaseModule],
  providers: [SocketIoService, SocketAuthMiddleware, UserPresenceService],
  exports: [SocketIoService, SocketAuthMiddleware]
})
export class SocketsModule {}
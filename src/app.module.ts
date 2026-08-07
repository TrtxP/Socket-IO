import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { SocketsModule } from './sockets/sockets.module';
import { AppController } from './app.controller';

const rootPath = join(__dirname);

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    ServeStaticModule.forRoot({
      rootPath: join(rootPath, 'public'),
      serveRoot: '/',
      exclude: ['/api*']
    }),
    AuthModule,
    UsersModule,
    MessagesModule,
    ChatModule,
    SocketsModule,
  ],
  controllers: [AppController]
})
export class AppModule {}
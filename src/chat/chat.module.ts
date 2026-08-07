import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [MessagesModule],
  controllers: [ChatController]
})
export class ChatModule {}
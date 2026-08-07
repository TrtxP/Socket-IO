import { Controller, Get, Param, Res } from '@nestjs/common';
import { join } from 'path';
import { MessagesService } from '../messages/messages.service';
import type { Response } from 'express';
import ejs from 'ejs';

@Controller('chat')
export class ChatController {
  constructor(private readonly _messagesService: MessagesService) {}

  @Get()
  async index(@Res() res: Response) {
    // Render the index.ejs for the general room
    const templatePath = join(__dirname, '..', 'views', 'index.ejs');
    const html = await ejs.renderFile(templatePath, { currentRoom: 'general' });
    res.send(html);
  }

  @Get(':room')
  async room(@Param('room') room: string, @Res() res: Response) {
    // Render the index.ejs for the specified room
    const templatePath = join(__dirname, '..', 'views', 'index.ejs');
    const html = await ejs.renderFile(templatePath, { currentRoom: room });
    res.send(html);
  }
}
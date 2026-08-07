import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  async getIndex(@Res() res: Response) {
    res.sendFile('main.html', { root: './public/main' });
  }
}
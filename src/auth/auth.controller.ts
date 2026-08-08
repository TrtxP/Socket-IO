import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { FastifyReply } from 'fastify';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() body: any, @Res() res: FastifyReply) {
    const { username, password, repeatPass } = body;

    // Validation
    if (!username || !password || !repeatPass) {
      return res.status(400).send("Data isn't filled in");
    }

    if (password !== repeatPass) {
      return res.status(400).send("The passwords don't match");
    }

    try {
      await this.authService.register(username, password);
      return res.status(200).send({ message: 'Registration successful' });
    } catch (err: any) {
      if (err.message === 'User already exists') {
        return res.status(409).send(`User ${username} already exists`);
      }
      console.log(`Error DB: ${err.message}`);
      return res.status(500).send('Error registration');
    }
  }

  @Post('login')
  async login(@Body() body: any, @Res() res: FastifyReply) {
    const { username, password } = body;

    // Validation
    if (!username || !password) {
      return res.status(400).send("Data isn't filled in");
    }

    try {
      const { token } = await this.authService.login(username, password);
      // Set HTTP-only cookie
      res.setCookie('token', token, { httpOnly: true, path: '/' });
      return res.status(200).send({ message: 'Login successful' });
    } catch (err: any) {
      if (err.message === 'Invalid credentials') {
        return res.status(401).send('Invalid password');
      }
      console.log(`Error auth: ${err.message}`);
      return res.status(500).send('Error authorization');
    }
  }
}
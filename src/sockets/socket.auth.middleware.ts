import { parse } from 'cookie';
import { JwtService } from '@nestjs/jwt';
import type { Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SocketAuthMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(socket: Socket, next: (err?: any) => void) {
    console.log('MIDDLEWARE CALLED');
    try {
      const cookies = parse(socket.handshake.headers.cookie || '');
      const token = cookies.token;

      if (!token) {
        return next(new Error('Authentication error: Token-missing'));
      }

      try {
        const decoded = this.jwtService.verify(token);
        (socket as any).user = decoded; // Attach decoded token (id, username)
        next();
      } catch (error: any) {
        console.log('SocketAuthMiddleware JWT Verify error:', error.name, error.message);
        console.log('SECRET AT SOCKET MIDDLEWARE:', process.env.JWT_SECRET_KEY);
        next(new Error('Authentication error: Invalid token'));
      }
    } catch (error) {
      console.log('SocketAuthMiddleware Outer error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  }
}
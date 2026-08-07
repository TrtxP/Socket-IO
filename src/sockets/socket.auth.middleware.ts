import cookie from 'cookie';
import { JwtService } from '@nestjs/jwt';
import type { Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SocketAuthMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(socket: Socket, next: (err?: any) => void) {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || '');
      const token = cookies.token;

      if (!token) {
        return next(new Error('Authentication error: Token-missing'));
      }

      try {
        const decoded = this.jwtService.verify(token);
        (socket as any).user = decoded; // Attach decoded token (id, username)
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  }
}
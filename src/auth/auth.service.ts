import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async register(username: string, password: string) {
    // Check if user already exists
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create new user
    const user = await this.usersService.createUser(username, password);
    return {
      id: user.id,
      username: user.username
    };
  }

  async login(username: string, password: string) {
    // Validate user
    const user = await this.usersService.validateUser(username, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = this.jwtService.sign(
      {
        id: user.id,
        username: user.username
      },
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username
      }
    };
  }

  async resetPassword(username: string, currentPassword: string, newPassword: string) {
    return this.usersService.resetPassword(username, currentPassword, newPassword);
  }
}
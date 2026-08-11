import bcrypt from 'bcrypt';
import { DatabaseService } from '../database/db.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) { }

  async findByUsername(username: string) {
    const result = await this.databaseService.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  }

  async createUser(username: string, password: string) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await this.databaseService.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, hashedPassword]
    );

    return result.rows[0];
  }

  async validateUser(username: string, password: string) {
    const user = await this.findByUsername(username);
    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return null;
    }

    return user;
  }

  async resetPassword(username: string, currentPassword: string, newPassword: string) {
    const user = await this.validateUser(username, currentPassword);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.databaseService.query(
      'UPDATE users SET password = $1 WHERE username = $2',
      [hashedPassword, username]
    );

    return { username: user.username };
  }
}
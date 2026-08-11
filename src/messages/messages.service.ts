import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/db.service';

@Injectable()
export class MessagesService {
  constructor(private databaseService: DatabaseService) {}

  async saveMessage(room: string, username: string, message: string) {
    await this.databaseService.query(
      'INSERT INTO messages (room, username, message) VALUES ($1, $2, $3)',
      [room, username, message]
    );
  }

  async getMessageHistory(room: string, limit: number = 50) {
    const result = await this.databaseService.query(
      `SELECT * FROM (
          SELECT username, message, created_at
          FROM messages
          WHERE room = $1
          ORDER BY created_at DESC
          LIMIT $2
        ) AS recent_messages
        ORDER BY created_at ASC;`,
      [room, limit]
    );
    return result.rows;
  }
}
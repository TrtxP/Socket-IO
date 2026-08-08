import { Pool } from 'pg';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { Injectable } from '@nestjs/common';

dotenv.config({ path: join(__dirname, '../../.env') });

@Injectable()
export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      port: Number(process.env.DB_PORT),
      password: String(process.env.DB_PASSWORD),
      database: process.env.DB_NAME
    });

    this.pool.connect().then(() => console.log('Database connected'));
  }

  query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }
}
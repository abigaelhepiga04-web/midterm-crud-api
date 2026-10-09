import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User],
  synchronize: process.env.NODE_ENV !== 'production',  // Auto-sync in development
  logging: process.env.NODE_ENV === 'development',     // Log SQL queries in dev
});


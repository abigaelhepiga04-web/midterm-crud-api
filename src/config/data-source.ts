import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Task } from '../entities/Task';
import { Category } from '../entities/Category';
import { Tag } from '../entities/Tag';
import * as dotenv from 'dotenv';
import path from 'path';



dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
   type: 'mysql',
   host: process.env.DB_HOST,
   port: parseInt(process.env.DB_PORT || '3306'),
   username: process.env.DB_USERNAME,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_DATABASE,
   entities: [User, Task, Category, Tag],
   synchronize: false,
   // synchronize: process.env.NODE_ENV !== 'production',  // Auto-sync in development
   logging: !isProduction,    // Log SQL queries in dev
   migrations: [path.join(__dirname, '../migrations/*.{ts,js}')],
});

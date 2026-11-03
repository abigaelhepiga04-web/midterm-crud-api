import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from './Task';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string; // e.g., 'Work', 'Personal', 'Urgent'

  @OneToMany(() => Task, (task) => task.category)
  tasks!: Task[];
}
import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
   UpdateDateColumn,
   OneToMany,
   Index
} from 'typeorm';
import { Task } from './Task';


@Entity('users')
@Index(['email'], { unique: true })
export class User {
   @PrimaryGeneratedColumn()
   id!: number;


   @Column({ type: 'varchar', length: 100 })
   name!: string;


   @Column({ type: 'varchar', length: 100 })
   email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber!: string | null;

   @Column({ type: 'varchar', length: 255, select: false })
   password!: string;


   @Column({ type: 'boolean', default: true })
   isActive!: boolean;


   // One-to-Many Relationship: A user can have many tasks
   @OneToMany(() => Task, task => task.user)
   tasks!: Task[];


   @CreateDateColumn()
   createdAt!: Date;


   @UpdateDateColumn()
   updatedAt!: Date;
}

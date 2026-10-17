import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
   UpdateDateColumn,
   ManyToOne,
   JoinColumn,
   Index
} from 'typeorm';
import { User } from './User';


@Entity('tasks')
@Index(['userId'])
export class Task {
   @PrimaryGeneratedColumn()
   id!: number;


   @Column({ type: 'varchar', length: 200 })
   title!: string;


   @Column({ type: 'text', nullable: true })
   description!: string | null;


   @Column({
       type: 'enum',
       enum: ['pending', 'in-progress', 'completed'],
       default: 'pending'
   })
   status!: 'pending' | 'in-progress' | 'completed';


   @Column({
       type: 'enum',
       enum: ['low', 'medium', 'high'],
       default: 'medium'
   })
   priority!: 'low' | 'medium' | 'high';


   @Column({ type: 'date', nullable: true })
   dueDate!: Date | null;


   // Many-to-One Relationship: Many tasks belong to one user
   @ManyToOne(() => User, user => user.tasks, { onDelete: 'CASCADE' })
   @JoinColumn({ name: 'userId' })
   user!: User;


   @Column({ type: 'int' })
   userId!: number;


   @CreateDateColumn()
   createdAt!: Date;


   @UpdateDateColumn()
   updatedAt!: Date;
}

import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   CreateDateColumn,
   UpdateDateColumn,
   ManyToOne,
   ManyToMany,
   JoinColumn,
   JoinTable,
   Index
} from 'typeorm';
import { User } from './User';
import { Category } from './Category';
import { Tag } from './Tag'
import { Expose } from 'class-transformer';

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

// Task 5 / Task 7: Nullable userId & ON DELETE SET NULL
  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user!: User | null;

  @Column({ type: 'int', nullable: true })
  userId!: number | null;

   // Task 3: Category Many-to-One relationship
  @ManyToOne(() => Category, (category) => category.tasks, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category!: Category | null;

  @Column({ type: 'int', nullable: true })
  categoryId!: number | null;

// Task 8: Soft delete flag
  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;

    @ManyToMany(() => Tag, (tag) => tag.tasks, { cascade: true })
    @JoinTable({
        name: 'task_tags',
        joinColumn: { name: 'task_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' }
    })
    tags!: Tag[];

   @CreateDateColumn()
   createdAt!: Date;


   @UpdateDateColumn()
   updatedAt!: Date;

    @Expose() // Ensures this virtual property is included when serialized to JSON
    get isOverdue(): boolean {
        if (!this.dueDate) return false;
        const now = new Date();
        // Compare date part or full timestamp
        return new Date(this.dueDate) < now && this.status !== 'completed';
    }
}

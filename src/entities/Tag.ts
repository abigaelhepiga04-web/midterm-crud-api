import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToMany, 
    CreateDateColumn, 
    UpdateDateColumn 
} from 'typeorm';
import { Task } from './Task';

@Entity('tags')
export class Tag {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    name!: string;

    @ManyToMany(() => Task, (task) => task.tags)
    tasks!: Task[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
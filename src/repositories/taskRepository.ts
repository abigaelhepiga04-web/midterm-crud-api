import { Repository } from 'typeorm';
import { Task } from '../entities/Task';
import { LessThan, Not } from 'typeorm';

export class TaskRepository extends Repository<Task> {
    async findOverdueTasks(): Promise<Task[]> {
        const today = new Date();
        return this.find({
            where: {
                dueDate: LessThan(today),
                status: Not('completed'),
                isDeleted: false
            },
            relations: { category: true }
        });
    }
}
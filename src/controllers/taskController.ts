// src/controllers/taskController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Task } from '../entities/Task';
import { User } from '../entities/User';
import { Category } from '../entities/Category';
import { CreateTaskDto } from '../dto/task.dto';
import { TaskRepository } from '../repositories/taskRepository';
import { instanceToPlain } from 'class-transformer';


const taskRepository = AppDataSource.getRepository(Task);
const userRepository = AppDataSource.getRepository(User);
const categoryRepository = AppDataSource.getRepository(Category);

// Helper function to strip basic HTML tags and prevent XSS (Task 26)
const sanitizeInput = (value: string | undefined): string => {
    if (!value || typeof value !== 'string') return value || '';
    return value.replace(/<[^>]*>?/gm, '').trim();
};

export class TaskController {
   // GET /api/users/:userId/tasks - Get all tasks for a user
   static async getUserTasks(req: Request, res: Response) {
       try {
        
        const userIdParam = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
        const userId = parseInt(userIdParam, 10);
        const { status, priority, page = '1', limit = '10', sortBy = 'createdAt', order = 'DESC' } = req.query;
          
           if (isNaN(userId)) {
               return res.status(400).json({
                   success: false,
                   error: { code: 'INVALID_ID', message: 'User ID must be a number' }
               });
           }

           const pageNum = Math.max(1, parseInt(page as string));
           const limitNum = Math.max(1, parseInt(limit as string));
           
           // Build query options
           const whereCondition: any = {
               userId,
               isDeleted: false // Task 8: Only return tasks where isDeleted = false
           };

           const user = await userRepository.findOne({ where: { id: userId } });
           if (!user) {
               return res.status(404).json({
                   success: false,
                   error: { code: 'USER_NOT_FOUND', message: 'User not found' }
               });
           }

             // Task 6: Filtering by status and priority
           if (status) whereCondition.status = status;
           if (priority) whereCondition.priority = priority;


            // Task 9 & 10: Pagination and Dynamic Sorting
           const [tasks, total] = await taskRepository.findAndCount({
               where: whereCondition,
               relations: { category: true },
               order: { [sortBy as string]: (order as string).toUpperCase() === 'ASC' ? 'ASC' : 'DESC' },
               take: limitNum,
               skip: (pageNum - 1) * limitNum
           });


           res.json({
               success: true,
               data: instanceToPlain(tasks),
               meta: {
                   total,
                   page: pageNum,
                   limit: limitNum,
                   totalPages: Math.ceil(total / limitNum)
               }
           });
       } catch (error) {
           console.error('Error fetching tasks:', error);
           res.status(500).json({
               success: false,
               error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch tasks' }
           });
       }
   }


    // GET /api/tasks/overdue - Get all overdue tasks using the custom repository
    static async getOverdueTasks(req: Request, res: Response) {
        try {
            // Instantiate your custom repository class directly using the entity and active manager
            const taskRepo = new TaskRepository(Task, AppDataSource.manager);
            const overdueTasks = await taskRepo.findOverdueTasks();

            return res.status(200).json({
                success: true,
                count: overdueTasks.length,
                data: instanceToPlain(overdueTasks)
            });
        } catch (error) {
            console.error('Error fetching overdue tasks:', error);
            return res.status(500).json({
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch overdue tasks' }
            });
        }
    }

   // POST /api/users/:userId/tasks - Create a task for a user
   static async createTask(req: Request, res: Response) {
       try {
          const userIdParam = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
          const userId = parseInt(userIdParam, 10);
           const { title, description, status, priority, dueDate, categoryId }: CreateTaskDto = req.body;


           if (isNaN(userId)) {
               return res.status(400).json({
                   success: false,
                   error: { code: 'INVALID_ID', message: 'User ID must be a number' }
               });
           }


           // Verify user exists
           const user = await userRepository.findOne({ where: { id: userId } });
           if (!user) {
               return res.status(404).json({
                   success: false,
                   error: { code: 'USER_NOT_FOUND', message: 'User not found' }
               });
           }


           // Validate enum values
           if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
               return res.status(400).json({
                   success: false,
                   error: { code: 'INVALID_STATUS', message: 'Invalid status value' }
               });
           }


           if (priority && !['low', 'medium', 'high'].includes(priority)) {
               return res.status(400).json({
                   success: false,
                   error: { code: 'INVALID_PRIORITY', message: 'Invalid priority value' }
               });
           }


            let category: Category | null = null;
            if (categoryId) {
                category = await categoryRepository.findOne({ where: { id: categoryId } });
                if (!category) {
                return res.status(404).json({ success: false, error: { code: 'CATEGORY_NOT_FOUND', message: 'Category not found' } });
                }
            }

            // Sanitize title and description to strip out HTML tags and prevent XSS (Task 26)
            const cleanTitle = sanitizeInput(title);
            const cleanDescription = sanitizeInput(description);

           const task = taskRepository.create({
               title: cleanTitle,
               description: cleanDescription,
               status: status || 'pending',
               priority: priority || 'medium',
               dueDate: dueDate || null,
               userId,
               categoryId: category ? category.id : null
           });


           const savedTask = await taskRepository.save(task);


           res.status(201).json({
               success: true,
               message: 'Task created successfully',
               data: instanceToPlain(savedTask)
           });
       } catch (error) {
           console.error('Error creating task:', error);
           res.status(500).json({
               success: false,
               error: { code: 'INTERNAL_ERROR', message: 'Failed to create task' }
           });
       }
   }

     // Task 7: Implement Aggregation Stats Endpoint GET /api/users/:userId/stats
    static async getUserStats(req: Request, res: Response) {
        try {

        const userIdParam = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
        const userId = parseInt(userIdParam, 10);
        
        const totalTasks = await taskRepository.count({ where: { userId, isDeleted: false } });
        const completedTasks = await taskRepository.count({ where: { userId, status: 'completed', isDeleted: false } });
        const pendingTasks = await taskRepository.count({ where: { userId, status: 'pending', isDeleted: false } });

        res.json({
            totalTasks,
            completedTasks,
            pendingTasks
        });
        } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' } });
        }
    }


   // DELETE /api/tasks/:id - Delete a task
   static async deleteTask(req: Request, res: Response) {
       try {
           const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
           const id = parseInt(idParam, 10);
          
           if (isNaN(id)) {
               return res.status(400).json({
                   success: false,
                   error: { code: 'INVALID_ID', message: 'Task ID must be a number' }
               });
           }


           const task = await taskRepository.findOne({ where: { id } });
           if (!task) {
               return res.status(404).json({
                   success: false,
                   error: { code: 'TASK_NOT_FOUND', message: 'Task not found' }
               });
           }

           task.isDeleted = true;
           await taskRepository.save(task);


           res.json({
               success: true,
               message: 'Task deleted successfully'
           });
       } catch (error) {
           console.error('Error deleting task:', error);
           res.status(500).json({
               success: false,
               error: { code: 'INTERNAL_ERROR', message: 'Failed to delete task' }
           });
       }
   }
}

// src/controllers/taskController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Task } from '../entities/Task';
import { User } from '../entities/User';


const taskRepository = AppDataSource.getRepository(Task);
const userRepository = AppDataSource.getRepository(User);


export class TaskController {
   // GET /api/users/:userId/tasks - Get all tasks for a user
   static async getUserTasks(req: Request, res: Response) {
       try {
        
        const userIdParam = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
        const userId = parseInt(userIdParam, 10);
          
           if (isNaN(userId)) {
               return res.status(400).json({
                   success: false,
                   error: { code: 'INVALID_ID', message: 'User ID must be a number' }
               });
           }


           const user = await userRepository.findOne({ where: { id: userId } });
           if (!user) {
               return res.status(404).json({
                   success: false,
                   error: { code: 'USER_NOT_FOUND', message: 'User not found' }
               });
           }


           const tasks = await taskRepository.find({
               where: { userId },
               order: { createdAt: 'DESC' }
           });


           res.json({
               success: true,
               count: tasks.length,
               data: tasks
           });
       } catch (error) {
           console.error('Error fetching tasks:', error);
           res.status(500).json({
               success: false,
               error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch tasks' }
           });
       }
   }


   // POST /api/users/:userId/tasks - Create a task for a user
   static async createTask(req: Request, res: Response) {
       try {
          const userIdParam = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
          const userId = parseInt(userIdParam, 10);
           const { title, description, status, priority, dueDate } = req.body;


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


           const task = taskRepository.create({
               title,
               description,
               status: status || 'pending',
               priority: priority || 'medium',
               dueDate: dueDate || null,
               userId
           });


           const savedTask = await taskRepository.save(task);


           res.status(201).json({
               success: true,
               message: 'Task created successfully',
               data: savedTask
           });
       } catch (error) {
           console.error('Error creating task:', error);
           res.status(500).json({
               success: false,
               error: { code: 'INTERNAL_ERROR', message: 'Failed to create task' }
           });
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


           await taskRepository.remove(task);


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

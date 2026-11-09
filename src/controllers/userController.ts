import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { Task } from '../entities/Task';
import { CreateUserDto } from '../dto/user.dto';
import { instanceToPlain } from 'class-transformer';
import bcrypt from 'bcrypt';



const userRepository = AppDataSource.getRepository(User);
const taskRespository = AppDataSource.getRepository(Task);

export const sanitizeInput = (value: string | undefined): string => {
    if (!value || typeof value !== 'string') return value || '';
    return value.replace(/<[^>]*>?/gm, '').trim();
};

export class UserController {
   // GET /api/users - Get all users
   static async getAll(req: Request, res: Response) {
       try {
           const users = await userRepository.find({
               select: {
                   id: true,
                   name: true,
                   email: true,
                   isActive: true,
                   createdAt: true,
                   updatedAt: true
               }
           });
          
           res.json({
               success: true,
               count: users.length,
               data: users
           });
       } catch (error) {
           console.error('Error fetching users:', error);
           res.status(500).json({
               success: false,
               error: {
                   code: 'INTERNAL_ERROR',
                   message: 'Failed to fetch users'
               }
           });
       }
   }


   // GET /api/users/:id - Get user by ID
   static async getById(req: Request, res: Response) {
       try {
           const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
           const id = parseInt(idParam, 10);

           if (isNaN(id)) {
               return res.status(400).json({
                   success: false,
                   error: {
                       code: 'INVALID_ID',
                       message: 'User ID must be a number'
                   }
               });
           }


           const user = await userRepository.findOne({
               where: { id },
               select: {
                   id: true,
                   name: true,
                   email: true,
                   isActive: true,
                   createdAt: true,
                   updatedAt: true,
                   tasks: true
               },
               relations: {
                    tasks: true
                } // Load related tasks
           });


           if (!user) {
               return res.status(404).json({
                   success: false,
                   error: {
                       code: 'USER_NOT_FOUND',
                       message: `User with ID ${id} does not exist`
                   }
               });
           }


           res.json({
               success: true,
               data: user
           });
       } catch (error) {
           console.error('Error fetching user:', error);
           res.status(500).json({
               success: false,
               error: {
                   code: 'INTERNAL_ERROR',
                   message: 'Failed to fetch user'
               }
           });
       }
   }


   // POST /api/users - Create a new user
   static async create(req: Request, res: Response) {
       try {
           const { name, email, password, phoneNumber }: CreateUserDto = req.body;


           // Validation
           if (!name || !email || !password) {
               return res.status(400).json({
                   success: false,
                   error: {
                       code: 'MISSING_FIELDS',
                       message: 'Name, email, and password are required'
                   }
               });
           }

            // Task 2: Optional phone number validation (simple Regex check)
            if (phoneNumber && !/^\+?[0-9]{7,15}$/.test(phoneNumber)) {
                return res.status(400).json({
                success: false,
                error: { code: 'INVALID_PHONE', message: 'Invalid phone number format' }
                });
            }


           // Check if email already exists
           const existingUser = await userRepository.findOne({ where: { email } });
           if (existingUser) {
               return res.status(409).json({
                   success: false,
                   error: {
                       code: 'EMAIL_EXISTS',
                       message: 'A user with this email already exists'
                   }
               });
           }

           const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
           const hashedPassword = await bcrypt.hash(password, saltRounds);

           // Create new user
           const user = userRepository.create({
               name,
               email,
               password: hashedPassword,  // In a real app, you would hash this with bcrypt!
               phoneNumber: phoneNumber || null
           });


           const savedUser = await userRepository.save(user);


           // Remove password from response
           const { password: _, ...userWithoutPassword } = savedUser;


           res.status(201).json({
               success: true,
               message: 'User created successfully',
               data: userWithoutPassword
           });
       } catch (error) {
           console.error('Error creating user:', error);
           res.status(500).json({
               success: false,
               error: {
                   code: 'INTERNAL_ERROR',
                   message: 'Failed to create user'
               }
           });
       }
   }


    // POST /api/users/with-initial-task - Create User and Task in a Transaction
    static async createUserWithInitialTask(req: Request, res: Response) {
        const { user: userData, task: taskData } = req.body;

        try {
            const userId = await AppDataSource.transaction(async (transactionalEntityManager) => {
                // 1. Validate required user fields
                if (!userData || !userData.email || !userData.password || !userData.name) {
                    throw new Error('Missing required user fields (name, email, password)');
                }

                // 2. Hash user password
                const hashedPassword = await bcrypt.hash(userData.password, 10);

                // 3. Create and save User
                const user = transactionalEntityManager.create(User, {
                    name: userData.name,
                    email: userData.email,
                    password: hashedPassword,
                    phoneNumber: userData.phoneNumber || null
                });
                const savedUser = await transactionalEntityManager.save(user);

                // 4. Create and save Initial Task (if provided) with Input Sanitization (Task 26)
                if (taskData && taskData.title) {
                    const cleanTitle = sanitizeInput(taskData.title);
                    const cleanDescription = sanitizeInput(taskData.description);

                    const task = transactionalEntityManager.create(Task, {
                        title: cleanTitle,
                        description: cleanDescription || '',
                        status: taskData.status || 'pending',
                        priority: taskData.priority || 'medium',
                        dueDate: taskData.dueDate || null,
                        userId: savedUser.id
                    });
                    await transactionalEntityManager.save(task);
                }

                return savedUser.id; // Return just the ID so we can cleanly fetch with relations outside or inside
            });

            // Fetch the fully populated user with tasks and apply instanceToPlain
            const completeUser = await AppDataSource.getRepository(User).findOne({
                where: { id: userId },
                relations: {
                    tasks: {
                        tags: true
                    }
                }
            });

            console.log("Tasks array:", completeUser?.tasks);
            console.log("Is overdue test:", completeUser?.tasks?.[0]?.isOverdue);

            return res.status(201).json({
                success: true,
                message: 'User and initial task created successfully within transaction',
                data: instanceToPlain(completeUser)
            });

        } catch (error: any) {
            console.error('Transaction rolled back due to error:', error.message);
            return res.status(400).json({
                success: false,
                error: {
                    code: 'TRANSACTION_FAILED',
                    message: error.message || 'Failed to complete transaction'
                }
            });
        }
    }


   // PUT /api/users/:id - Update a user
   static async update(req: Request, res: Response) {
       try {
            const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const id = parseInt(idParam, 10);
          
           if (isNaN(id)) {
               return res.status(400).json({
                   success: false,
                   error: {
                       code: 'INVALID_ID',
                       message: 'User ID must be a number'
                   }
               });
           }


           const user = await userRepository.findOne({ where: { id } });
          
           if (!user) {
               return res.status(404).json({
                   success: false,
                   error: {
                       code: 'USER_NOT_FOUND',
                       message: `User with ID ${id} does not exist`
                   }
               });
           }


           const { name, email, isActive } = req.body;


           // Check if email is being changed and already exists
           if (email && email !== user.email) {
               const existingUser = await userRepository.findOne({ where: { email } });
               if (existingUser) {
                   return res.status(409).json({
                       success: false,
                       error: {
                           code: 'EMAIL_EXISTS',
                           message: 'A user with this email already exists'
                       }
                   });
               }
           }


           // Update fields
           if (name !== undefined) user.name = name;
           if (email !== undefined) user.email = email;
           if (isActive !== undefined) user.isActive = isActive;


           const updatedUser = await userRepository.save(user);


           // Remove password from response
           const { password: _, ...userWithoutPassword } = updatedUser;


           res.json({
               success: true,
               message: 'User updated successfully',
               data: userWithoutPassword
           });
       } catch (error) {
           console.error('Error updating user:', error);
           res.status(500).json({
               success: false,
               error: {
                   code: 'INTERNAL_ERROR',
                   message: 'Failed to update user'
               }
           });
       }
   }


   // DELETE /api/users/:id - Delete a user
   static async delete(req: Request, res: Response) {
       try {
            const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const id = parseInt(idParam, 10);
          
           if (isNaN(id)) {
               return res.status(400).json({
                   success: false,
                   error: {
                       code: 'INVALID_ID',
                       message: 'User ID must be a number'
                   }
               });
           }


           const user = await userRepository.findOne({ where: { id } });
          
           if (!user) {
               return res.status(404).json({
                   success: false,
                   error: {
                       code: 'USER_NOT_FOUND',
                       message: `User with ID ${id} does not exist`
                   }
               });
           }


           await userRepository.remove(user);


           res.status(200).json({
               success: true,
               message: 'User deleted successfully'
           });
       } catch (error) {
           console.error('Error deleting user:', error);
           res.status(500).json({
               success: false,
               error: {
                   code: 'INTERNAL_ERROR',
                   message: 'Failed to delete user'
               }
           });
       }
   }
}

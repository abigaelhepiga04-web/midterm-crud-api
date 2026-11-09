import { Router } from 'express';
import { UserController } from '../../controllers/userController';

export const userRoutes = Router();

// GET /api/users
userRoutes.get('/', UserController.getAll);

// GET /api/users/:id
userRoutes.get('/:id', UserController.getById);

// POST /api/users
userRoutes.post('/', UserController.create);

userRoutes.post('/with-initial-task', UserController.createUserWithInitialTask);

// PUT /api/users/:id
userRoutes.put('/:id', UserController.update);

// DELETE /api/users/:id
userRoutes.delete('/:id', UserController.delete);


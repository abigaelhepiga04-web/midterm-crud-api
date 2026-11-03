import { Router } from 'express';
import { AuthController } from '../controllers/authController';

export const authRoutes = Router();
authRoutes.post('/login', AuthController.login);
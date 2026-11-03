import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { LoginDto } from '../dto/user.dto';

const userRepository = AppDataSource.getRepository(User);

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginDto = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_FIELDS', message: 'Email and password are required' }
        });
      }

      // Query password explicitly since select: false is set on entity
      const user = await userRepository.findOne({
        where: { email },
        select: {
            id: true,
            name: true,
            email: true,
            password: true,
            isActive: true,
            phoneNumber: true,
            createdAt: true,
            updatedAt: true
          }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
        });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({
        success: true,
        message: 'Login successful',
        data: userWithoutPassword
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Login failed' }
      });
    }
  }
}
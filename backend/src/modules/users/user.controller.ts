import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { userService } from './user.service';

export class UserController {
  async register(req: AuthRequest, res: Response): Promise<void> {
    const user = await userService.register(req.body);
    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    const result = await userService.login(req.body);
    res.json(result);
  }

  async refreshToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tokens = await userService.refreshToken(req.body.refreshToken);
      res.json(tokens);
    } catch (error) {
      // Error will be handled by error middleware
      throw error;
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    const user = await userService.getProfile(req.userId!);
    res.json(user);
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    const user = await userService.updateProfile(req.userId!, req.body);
    res.json({
      message: 'Profile updated successfully',
      user,
    });
  }
}

export const userController = new UserController();


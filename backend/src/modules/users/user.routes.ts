import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
} from './user.types';
import { authLimiter } from '../../middleware/rateLimit.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(userController.register.bind(userController)));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(userController.login.bind(userController)));
router.post('/refresh', validate(refreshTokenSchema), asyncHandler(userController.refreshToken.bind(userController)));
router.get('/profile', authenticate, asyncHandler(userController.getProfile.bind(userController)));
router.put('/profile', authenticate, validate(updateProfileSchema), asyncHandler(userController.updateProfile.bind(userController)));

export default router;


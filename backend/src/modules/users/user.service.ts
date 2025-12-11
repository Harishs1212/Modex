import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';
import { config } from '../../config/env';
import { AppError } from '../../middleware/error.middleware';
import { USER_ROLES } from '../../utils/constants';
import {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
} from './user.types';
import { JWTPayload } from '../../middleware/auth.middleware';

export class UserService {
  /**
   * Register a new user
   */
  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        address: data.address,
        role: USER_ROLES.PATIENT,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Login user and generate tokens
   */
  async login(data: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    try {
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as JWTPayload;

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Generate new tokens
      return this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      // Handle JWT errors
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid refresh token', 401);
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Refresh token expired', 401);
      }
      if (error instanceof AppError) {
        throw error;
      }
      // Re-throw other errors
      throw new AppError('Token refresh failed', 500);
    }
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        insuranceProvider: true,
        insurancePolicyNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        address: data.address,
        insuranceProvider: data.insuranceProvider,
        insurancePolicyNumber: data.insurancePolicyNumber,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        insuranceProvider: true,
        insurancePolicyNumber: true,
        role: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(payload: JWTPayload) {
    const accessToken = jwt.sign(
      payload,
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiry } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      payload,
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiry } as jwt.SignOptions
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}

export const userService = new UserService();


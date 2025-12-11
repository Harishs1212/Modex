import prisma from '../config/database';
import { Request } from 'express';

export interface ActivityLogData {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log activity for audit trail
 */
export async function logActivity(
  data: ActivityLogData,
  req?: Request
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details || {},
        ipAddress: data.ipAddress || req?.ip || req?.socket.remoteAddress,
        userAgent: data.userAgent || req?.get('user-agent'),
      },
    });
  } catch (error) {
    // Don't throw - logging should not break the main flow
    console.error('Failed to log activity:', error);
  }
}

/**
 * Get activity logs with filters
 */
export async function getActivityLogs(filters: {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) {
  const {
    userId,
    action,
    entityType,
    entityId,
    startDate,
    endDate,
    page = 1,
    limit = 50,
  } = filters;

  const skip = (page - 1) * limit;

  const where: any = {};
  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}


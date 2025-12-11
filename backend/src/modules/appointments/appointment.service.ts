import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { RedisClient } from '../../utils/redis.client';
import { REDIS_KEYS, REDIS_TTL, APPOINTMENT_STATUS } from '../../utils/constants';
import {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  GetAppointmentsQuery,
} from './appointment.types';
import { isSlotAvailable } from './slot.engine';

export class AppointmentService {
  /**
   * Create appointment with concurrency protection
   */
  async createAppointment(patientId: string, data: CreateAppointmentInput) {
    const appointmentDate = new Date(data.appointmentDate);
    const lockKey = REDIS_KEYS.appointmentLock(
      data.doctorId,
      `${appointmentDate.toISOString()}-${data.startTime}`
    );

    // Try to acquire lock
    const lockAcquired = await RedisClient.acquireLock(lockKey, REDIS_TTL.appointmentLock);

    if (!lockAcquired) {
      throw new AppError('Slot is currently being booked. Please try again.', 409);
    }

    try {
      // Calculate end time (assuming 30-minute slots)
      const [startHour, startMin] = data.startTime.split(':').map(Number);
      let endHour = startHour;
      let endMin = startMin + 30;
      if (endMin >= 60) {
        endMin -= 60;
        endHour += 1;
      }
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

      // Check if slot is still available
      const slotAvailable = await isSlotAvailable(
        data.doctorId,
        appointmentDate,
        data.startTime,
        endTime
      );

      if (!slotAvailable) {
        throw new AppError('This time slot is no longer available', 409);
      }

      // Create appointment in transaction
      const appointment = await prisma.$transaction(async (tx) => {
        // Double-check slot availability in transaction
        const existing = await tx.appointment.findFirst({
          where: {
            doctorId: data.doctorId,
            appointmentDate,
            startTime: data.startTime,
            status: {
              not: 'CANCELLED',
            },
          },
        });

        if (existing && existing.status !== 'CANCELLED') {
          throw new AppError('This time slot is already booked', 409);
        }

        // Create appointment
        return tx.appointment.create({
          data: {
            patientId,
            doctorId: data.doctorId,
            appointmentDate,
            startTime: data.startTime,
            endTime,
            notes: data.notes,
            status: APPOINTMENT_STATUS.PENDING,
          },
          include: {
            patient: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            doctor: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                doctorProfile: {
                  select: {
                    id: true,
                    specialization: true,
                  },
                },
              },
            },
          },
        });
      });

      // Set pending state in Redis
      await RedisClient.setCache(
        REDIS_KEYS.appointmentPending(appointment.id),
        'pending',
        REDIS_TTL.appointmentPending
      );

      // Clear slots cache for this doctor/date
      const dateStr = appointmentDate.toISOString().split('T')[0];
      await RedisClient.del(REDIS_KEYS.slotsCache(data.doctorId, dateStr));

      return appointment;
    } finally {
      // Release lock
      await RedisClient.releaseLock(lockKey);
    }
  }

  /**
   * Get appointments with filters
   */
  async getAppointments(userId: string, userRole: string, query: GetAppointmentsQuery) {
    const { page = 1, limit = 10, patientId, doctorId, status, startDate, endDate } = query;
    
    // Ensure page and limit are numbers
    const pageNum = typeof page === 'number' ? page : parseInt(String(page), 10) || 1;
    const limitNum = typeof limit === 'number' ? limit : parseInt(String(limit), 10) || 10;
    
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Role-based filtering
    if (userRole === 'PATIENT') {
      where.patientId = userId;
    } else if (userRole === 'DOCTOR') {
      // Appointments use User.id as doctorId (not Doctor.id)
      // So we can directly use the userId
      where.doctorId = userId;
    }

    // Additional filters
    if (patientId) {
      where.patientId = patientId;
    }
    if (doctorId) {
      where.doctorId = doctorId;
    }
    if (status) {
      where.status = status;
    }
    if (startDate || endDate) {
      where.appointmentDate = {};
      if (startDate) {
        where.appointmentDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.appointmentDate.lte = new Date(endDate);
      }
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          patient: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          doctor: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              doctorProfile: {
                select: {
                  id: true,
                  specialization: true,
                },
              },
            },
          },
        },
        orderBy: {
          appointmentDate: 'desc',
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      appointments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Update appointment
   */
  async updateAppointment(
    appointmentId: string,
    userId: string,
    userRole: string,
    data: UpdateAppointmentInput
  ) {
    // Get appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // Check permissions
    let isAuthorized = false;
    if (userRole === 'ADMIN') {
      isAuthorized = true;
    } else if (userRole === 'PATIENT' && appointment.patientId === userId) {
      isAuthorized = true;
    } else if (userRole === 'DOCTOR') {
      // Appointments use User.id as doctorId (not Doctor.id)
      // So we can directly compare with userId
      if (appointment.doctorId === userId) {
        isAuthorized = true;
      }
    }
    
    if (!isAuthorized) {
      throw new AppError('Unauthorized to update this appointment', 403);
    }

    // Update appointment with optimistic locking
    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.appointment.findUnique({
        where: { id: appointmentId },
      });

      if (!current) {
        throw new AppError('Appointment not found', 404);
      }

      return tx.appointment.update({
        where: {
          id: appointmentId,
          version: current.version, // Optimistic locking
        },
        data: {
          appointmentDate: data.appointmentDate ? new Date(data.appointmentDate) : undefined,
          startTime: data.startTime,
          notes: data.notes,
          status: data.status,
          version: {
            increment: 1,
          },
          cancelledAt: data.status === 'CANCELLED' ? new Date() : undefined,
        },
        include: {
          patient: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          doctor: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              doctorProfile: {
                select: {
                  id: true,
                  specialization: true,
                },
              },
            },
          },
        },
      });
    });

    return updated;
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId: string, userId: string, userRole: string) {
    return this.updateAppointment(
      appointmentId,
      userId,
      userRole,
      { status: 'CANCELLED' }
    );
  }

  /**
   * Accept appointment (Doctor only)
   */
  async acceptAppointment(appointmentId: string, doctorId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    if (appointment.doctorId !== doctorId) {
      throw new AppError('Unauthorized to accept this appointment', 403);
    }

    if (appointment.status !== 'PENDING') {
      throw new AppError(`Cannot accept appointment with status: ${appointment.status}`, 400);
    }

    return this.updateAppointment(
      appointmentId,
      doctorId,
      'DOCTOR',
      { status: 'CONFIRMED' }
    );
  }

  /**
   * Decline appointment (Doctor only)
   */
  async declineAppointment(appointmentId: string, doctorId: string, reason?: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    if (appointment.doctorId !== doctorId) {
      throw new AppError('Unauthorized to decline this appointment', 403);
    }

    if (appointment.status !== 'PENDING') {
      throw new AppError(`Cannot decline appointment with status: ${appointment.status}`, 400);
    }

    return this.updateAppointment(
      appointmentId,
      doctorId,
      'DOCTOR',
      { 
        status: 'CANCELLED',
        notes: reason ? `${appointment.notes || ''}\nDeclined: ${reason}`.trim() : (appointment.notes || undefined)
      }
    );
  }

  /**
   * Mark appointment as completed (Doctor only)
   */
  async completeAppointment(appointmentId: string, doctorId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    if (appointment.doctorId !== doctorId) {
      throw new AppError('Unauthorized to complete this appointment', 403);
    }

    if (appointment.status !== 'CONFIRMED') {
      throw new AppError(`Cannot complete appointment with status: ${appointment.status}`, 400);
    }

    return this.updateAppointment(
      appointmentId,
      doctorId,
      'DOCTOR',
      { status: 'COMPLETED' }
    );
  }

  /**
   * Mark appointment as missed
   */
  async markMissedAppointment(appointmentId: string, userId: string, userRole: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // Only doctor or admin can mark as missed
    if (userRole === 'ADMIN') {
      // Admin can mark any appointment as missed
    } else if (userRole === 'DOCTOR') {
      // Appointments use User.id as doctorId (not Doctor.id)
      // So we can directly compare with userId
      if (appointment.doctorId !== userId) {
        throw new AppError('Unauthorized to mark this appointment as missed', 403);
      }
    } else {
      throw new AppError('Unauthorized to mark this appointment as missed', 403);
    }

    return this.updateAppointment(
      appointmentId,
      userId,
      userRole,
      { status: 'MISSED' }
    );
  }
}

export const appointmentService = new AppointmentService();


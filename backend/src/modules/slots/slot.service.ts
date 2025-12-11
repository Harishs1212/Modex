import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { RedisClient } from '../../utils/redis.client';
import { REDIS_KEYS, REDIS_TTL } from '../../utils/constants';
import {
  CreateSlotInput,
  UpdateSlotInput,
  GetSlotsQuery,
  BookSlotInput,
  MovePatientInput,
} from './slot.types';

export class SlotService {
  /**
   * Create a new slot with capacity
   */
  async createSlot(data: CreateSlotInput) {
    const slotDate = new Date(data.slotDate);
    
    // Check if slot already exists
    const existing = await prisma.slot.findUnique({
      where: {
        doctorId_slotDate_startTime: {
          doctorId: data.doctorId,
          slotDate,
          startTime: data.startTime,
        },
      },
    });

    if (existing) {
      throw new AppError('Slot already exists for this time', 409);
    }

    // Validate time range
    const [startHour, startMin] = data.startTime.split(':').map(Number);
    const [endHour, endMin] = data.endTime.split(':').map(Number);
    
    if (startHour > endHour || (startHour === endHour && startMin >= endMin)) {
      throw new AppError('End time must be after start time', 400);
    }

    const slot = await prisma.slot.create({
      data: {
        doctorId: data.doctorId,
        slotDate,
        startTime: data.startTime,
        endTime: data.endTime,
        maxCapacity: data.maxCapacity,
      },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Clear cache
    const dateStr = slotDate.toISOString().split('T')[0];
    await RedisClient.del(REDIS_KEYS.slotsCache(data.doctorId, dateStr));

    return slot;
  }

  /**
   * Update slot details
   */
  async updateSlot(slotId: string, data: UpdateSlotInput) {
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: {
        appointments: {
          where: {
            status: { not: 'CANCELLED' },
          },
        },
      },
    });

    if (!slot) {
      throw new AppError('Slot not found', 404);
    }

    // If updating capacity, ensure it's not less than current bookings
    if (data.maxCapacity !== undefined && data.maxCapacity < slot.currentBookings) {
      throw new AppError(
        `Cannot reduce capacity below current bookings (${slot.currentBookings})`,
        400
      );
    }

    const updateData: any = {};
    if (data.slotDate) updateData.slotDate = new Date(data.slotDate);
    if (data.startTime) updateData.startTime = data.startTime;
    if (data.endTime) updateData.endTime = data.endTime;
    if (data.maxCapacity !== undefined) updateData.maxCapacity = data.maxCapacity;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    updateData.version = { increment: 1 };

    const updated = await prisma.slot.update({
      where: { id: slotId },
      data: updateData,
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Clear cache
    const dateStr = updated.slotDate.toISOString().split('T')[0];
    await RedisClient.del(REDIS_KEYS.slotsCache(updated.doctorId, dateStr));

    return updated;
  }

  /**
   * Delete slot (only if no active bookings)
   */
  async deleteSlot(slotId: string) {
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: {
        appointments: {
          where: {
            status: { not: 'CANCELLED' },
          },
        },
      },
    });

    if (!slot) {
      throw new AppError('Slot not found', 404);
    }

    if (slot.appointments.length > 0) {
      throw new AppError(
        'Cannot delete slot with active bookings. Cancel bookings first or move patients.',
        400
      );
    }

    await prisma.slot.delete({
      where: { id: slotId },
    });

    // Clear cache
    const dateStr = slot.slotDate.toISOString().split('T')[0];
    await RedisClient.del(REDIS_KEYS.slotsCache(slot.doctorId, dateStr));

    return { message: 'Slot deleted successfully' };
  }

  /**
   * Get slots with filtering and pagination
   */
  async getSlots(query: GetSlotsQuery) {
    const where: any = {};

    if (query.doctorId) {
      where.doctorId = query.doctorId;
    }

    if (query.date) {
      const date = new Date(query.date);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.slotDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      where.slotDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (query.isActive !== undefined && query.isActive !== null) {
      // Ensure isActive is a boolean (handle string "true"/"false" from query params)
      const isActiveValue = typeof query.isActive === 'boolean' 
        ? query.isActive 
        : query.isActive === 'true' || query.isActive === '1' || query.isActive === true;
      where.isActive = isActiveValue;
    }

    // Ensure page and limit are numbers (handle string values from query params)
    const pageNum = typeof query.page === 'number' ? query.page : parseInt(String(query.page), 10) || 1;
    const limitNum = typeof query.limit === 'number' ? query.limit : parseInt(String(query.limit), 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [slots, total] = await Promise.all([
      prisma.slot.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [
          { slotDate: 'asc' },
          { startTime: 'asc' },
        ],
        include: {
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          appointments: {
            where: {
              status: { not: 'CANCELLED' },
            },
            include: {
              patient: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
            orderBy: [
              { isPriority: 'desc' }, // High-risk patients first
              { createdAt: 'asc' },
            ],
          },
        },
      }),
      prisma.slot.count({ where }),
    ]);

    return {
      slots: slots.map((slot) => ({
        ...slot,
        isFull: slot.currentBookings >= slot.maxCapacity,
        availableSpots: slot.maxCapacity - slot.currentBookings,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get single slot with details
   */
  async getSlotById(slotId: string) {
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            doctorProfile: {
              select: {
                specialization: true,
                yearsOfExperience: true,
              },
            },
          },
        },
        appointments: {
          where: {
            status: { not: 'CANCELLED' },
          },
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: [
            { isPriority: 'desc' }, // High-risk patients first
            { createdAt: 'asc' },
          ],
        },
      },
    });

    if (!slot) {
      throw new AppError('Slot not found', 404);
    }

    return {
      ...slot,
      isFull: slot.currentBookings >= slot.maxCapacity,
      availableSpots: slot.maxCapacity - slot.currentBookings,
    };
  }

  /**
   * Book a slot with concurrency control
   */
  async bookSlot(patientId: string, data: BookSlotInput) {
    const lockKey = REDIS_KEYS.slotBookingLock(data.slotId);
    
    // Try to acquire lock
    const lockAcquired = await RedisClient.acquireLock(lockKey, REDIS_TTL.slotBookingLock);

    if (!lockAcquired) {
      throw new AppError('Slot is currently being booked. Please try again.', 409);
    }

    try {
      // Get patient's latest risk level
      const latestRisk = await prisma.riskPrediction.findFirst({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        select: { riskLevel: true },
      });

      const isPriority = latestRisk?.riskLevel === 'HIGH';

      // Book slot in transaction with row-level locking
      const result = await prisma.$transaction(async (tx) => {
        // Lock the slot row for update
        const slot = await tx.slot.findUnique({
          where: { id: data.slotId },
        });

        if (!slot) {
          throw new AppError('Slot not found', 404);
        }

        if (!slot.isActive) {
          throw new AppError('Slot is not active', 400);
        }

        if (slot.currentBookings >= slot.maxCapacity) {
          throw new AppError('Slot is full', 409);
        }

        // Check if patient already has an appointment in this slot
        const existingAppointment = await tx.appointment.findFirst({
          where: {
            patientId,
            slotId: data.slotId,
            status: { not: 'CANCELLED' },
          },
        });

        if (existingAppointment) {
          throw new AppError('You already have a booking in this slot', 409);
        }

        // Create appointment
        const appointment = await tx.appointment.create({
          data: {
            patientId,
            doctorId: slot.doctorId,
            slotId: data.slotId,
            appointmentDate: slot.slotDate,
            startTime: slot.startTime,
            endTime: slot.endTime,
            notes: data.notes,
            isPriority,
            bookingStatus: 'CONFIRMED',
            status: 'PENDING',
          },
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            slot: true,
          },
        });

        // Increment slot bookings atomically
        await tx.slot.update({
          where: { id: data.slotId },
          data: {
            currentBookings: { increment: 1 },
            version: { increment: 1 },
          },
        });

        return appointment;
      });

      // Clear cache
      const slot = await prisma.slot.findUnique({
        where: { id: data.slotId },
        select: { slotDate: true, doctorId: true },
      });
      
      if (slot) {
        const dateStr = slot.slotDate.toISOString().split('T')[0];
        await RedisClient.del(REDIS_KEYS.slotsCache(slot.doctorId, dateStr));
      }

      return result;
    } finally {
      await RedisClient.releaseLock(lockKey);
    }
  }

  /**
   * Move patient to another slot (Admin only)
   */
  async movePatientToSlot(_adminId: string, data: MovePatientInput) {
    const lockKey = REDIS_KEYS.slotBookingLock(data.newSlotId);
    const lockAcquired = await RedisClient.acquireLock(lockKey, REDIS_TTL.slotBookingLock);

    if (!lockAcquired) {
      throw new AppError('Slot is currently being modified. Please try again.', 409);
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Get current appointment
        const appointment = await tx.appointment.findUnique({
          where: { id: data.appointmentId },
          include: { slot: true },
        });

        if (!appointment) {
          throw new AppError('Appointment not found', 404);
        }

        if (appointment.status === 'CANCELLED') {
          throw new AppError('Cannot move cancelled appointment', 400);
        }

        // Get new slot
        const newSlot = await tx.slot.findUnique({
          where: { id: data.newSlotId },
        });

        if (!newSlot) {
          throw new AppError('New slot not found', 404);
        }

        if (!newSlot.isActive) {
          throw new AppError('New slot is not active', 400);
        }

        if (newSlot.currentBookings >= newSlot.maxCapacity) {
          throw new AppError('New slot is full', 409);
        }

        const oldSlotId = appointment.slotId;

        // Update appointment
        const updatedAppointment = await tx.appointment.update({
          where: { id: data.appointmentId },
          data: {
            slotId: data.newSlotId,
            appointmentDate: newSlot.slotDate,
            startTime: newSlot.startTime,
            endTime: newSlot.endTime,
            version: { increment: 1 },
          },
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            slot: true,
          },
        });

        // Decrement old slot bookings
        if (oldSlotId) {
          await tx.slot.update({
            where: { id: oldSlotId },
            data: {
              currentBookings: { decrement: 1 },
              version: { increment: 1 },
            },
          });
        }

        // Increment new slot bookings
        await tx.slot.update({
          where: { id: data.newSlotId },
          data: {
            currentBookings: { increment: 1 },
            version: { increment: 1 },
          },
        });

        return updatedAppointment;
      });

      // Clear cache for both slots
      const appointment = await prisma.appointment.findUnique({
        where: { id: data.appointmentId },
        include: { slot: true },
      });

      if (appointment?.slot) {
        const dateStr = appointment.slot.slotDate.toISOString().split('T')[0];
        await RedisClient.del(REDIS_KEYS.slotsCache(appointment.slot.doctorId, dateStr));
      }

      return result;
    } finally {
      await RedisClient.releaseLock(lockKey);
    }
  }

  /**
   * Get available slots for a doctor on a date
   */
  async getAvailableSlots(doctorId: string, date: string) {
    const slotDate = new Date(date);
    const startOfDay = new Date(slotDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(slotDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Try cache first
    const cacheKey = REDIS_KEYS.slotsCache(doctorId, date);
    const cached = await RedisClient.getCache(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const slots = await prisma.slot.findMany({
      where: {
        doctorId,
        slotDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        isActive: true,
      },
      orderBy: [
        { startTime: 'asc' },
      ],
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            doctorProfile: {
              select: {
                specialization: true,
              },
            },
          },
        },
      },
    });

    const result = slots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxCapacity: slot.maxCapacity,
      currentBookings: slot.currentBookings,
      availableSpots: slot.maxCapacity - slot.currentBookings,
      isFull: slot.currentBookings >= slot.maxCapacity,
      isActive: slot.isActive,
      doctor: slot.doctor,
    }));

    // Cache for 5 minutes
    await RedisClient.setCache(cacheKey, JSON.stringify(result), 300);

    return result;
  }
}


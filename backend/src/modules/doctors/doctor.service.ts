import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import {
  CreateDoctorInput,
  UpdateAvailabilityInput,
  GetDoctorsQuery,
} from './doctor.types';

export class DoctorService {
  /**
   * Create a new doctor profile
   */
  async createDoctor(data: CreateDoctorInput) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user already has a doctor profile
    const existingDoctor = await prisma.doctor.findUnique({
      where: { userId: data.userId },
    });

    if (existingDoctor) {
      throw new AppError('Doctor profile already exists for this user', 409);
    }

    // Update user role to DOCTOR
    await prisma.user.update({
      where: { id: data.userId },
      data: { role: 'DOCTOR' },
    });

    // Create doctor profile
    const doctor = await prisma.doctor.create({
      data: {
        userId: data.userId,
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        yearsOfExperience: data.yearsOfExperience,
        bio: data.bio,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    return doctor;
  }

  /**
   * Get all doctors with pagination
   */
  async getDoctors(query: GetDoctorsQuery) {
    const { page = 1, limit = 10, specialization, isAvailable } = query;
    const pageNum = typeof page === 'number' ? page : 1;
    const limitNum = typeof limit === 'number' ? limit : 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (specialization) {
      where.specialization = specialization;
    }
    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable;
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.doctor.count({ where }),
    ]);

    return {
      doctors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get available doctors for a specific date (with available slots)
   */
  async getAvailableDoctorsForDate(date: string) {
    const slotDate = new Date(date);
    const startOfDay = new Date(slotDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(slotDate);
    endOfDay.setHours(23, 59, 59, 999);

    // First, get all slots for this date with available capacity
    const availableSlots = await prisma.slot.findMany({
      where: {
        slotDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        isActive: true,
        currentBookings: {
          lt: prisma.slot.fields.maxCapacity,
        },
      },
      include: {
        doctor: {
          include: {
            doctorProfile: {
              include: {
                department: true,
              },
            },
          },
        },
      },
    });

    // Group slots by doctor
    const doctorMap = new Map<string, any>();
    
    for (const slot of availableSlots) {
      const doctorId = slot.doctorId;
      const doctorProfile = slot.doctor.doctorProfile;
      
      // Include doctors with profiles and available slots
      // Admin can set slots for any doctor, so we show all doctors with slots
      if (!doctorProfile || !doctorProfile.isAvailable) {
        continue;
      }
      
      if (!doctorMap.has(doctorId)) {
        doctorMap.set(doctorId, {
          id: doctorProfile.id,
          userId: doctorProfile.userId,
          specialization: doctorProfile.specialization,
          yearsOfExperience: doctorProfile.yearsOfExperience,
          bio: doctorProfile.bio,
          user: {
            id: slot.doctor.id,
            email: slot.doctor.email,
            firstName: slot.doctor.firstName,
            lastName: slot.doctor.lastName,
            phone: slot.doctor.phone,
          },
          department: doctorProfile.department,
          slots: [],
        });
      }
      
      const doctor = doctorMap.get(doctorId);
      if (doctor) {
        doctor.slots.push({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          maxCapacity: slot.maxCapacity,
          currentBookings: slot.currentBookings,
          isActive: slot.isActive,
        });
      }
    }

    // Format response
    return Array.from(doctorMap.values()).map((doctor) => {
      const activeSlots = doctor.slots.filter((slot: any) => slot.isActive !== false);
      const hasActiveSlots = activeSlots.length > 0;
      
      return {
        id: doctor.id,
        userId: doctor.userId,
        specialization: doctor.specialization,
        yearsOfExperience: doctor.yearsOfExperience,
        bio: doctor.bio,
        user: doctor.user,
        department: doctor.department,
        availableSlots: doctor.slots.map((slot: any) => ({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          availableSpots: slot.maxCapacity - slot.currentBookings,
          maxCapacity: slot.maxCapacity,
          currentBookings: slot.currentBookings,
          isFull: slot.currentBookings >= slot.maxCapacity,
          isActive: slot.isActive !== false,
        })),
        totalAvailableSlots: doctor.slots.filter(
          (slot: any) => slot.currentBookings < slot.maxCapacity && slot.isActive !== false
        ).length,
        isActiveOnDate: hasActiveSlots, // Doctor has at least one active slot on this date
      };
    });
  }

  /**
   * Get doctor by ID
   */
  async getDoctorById(doctorId: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            dateOfBirth: true,
            address: true,
          },
        },
        availability: true,
      },
    });

    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    return doctor;
  }

  /**
   * Update doctor availability
   */
  async updateAvailability(doctorId: string, data: UpdateAvailabilityInput) {
    // Verify doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    // Delete existing availability
    await prisma.doctorAvailability.deleteMany({
      where: { doctorId },
    });

    // Create new availability
    const availability = await prisma.doctorAvailability.createMany({
      data: data.availability.map((avail) => ({
        doctorId,
        dayOfWeek: avail.dayOfWeek,
        startTime: avail.startTime,
        endTime: avail.endTime,
      })),
    });

    return {
      message: 'Availability updated successfully',
      count: availability.count,
    };
  }
}

export const doctorService = new DoctorService();


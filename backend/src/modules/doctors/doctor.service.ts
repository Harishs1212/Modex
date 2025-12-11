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
    const { page, limit, specialization, isAvailable } = query;
    const skip = (page - 1) * limit;

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
        take: limit,
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
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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


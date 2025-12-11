import bcrypt from 'bcrypt';
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { logActivity } from '../../utils/activityLogger';
import { RedisClient } from '../../utils/redis.client';
import { REDIS_KEYS } from '../../utils/constants';
import {
  CreateUserInput,
  UpdateUserInput,
  ResetPasswordInput,
  ApproveDoctorInput,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateTreatmentCategoryInput,
  UpdateTreatmentCategoryInput,
  AnalyticsQuery,
  UpdateAttendanceInput,
  UpdateRiskLevelInput,
  CreateDoctorProfileInput,
  SetDoctorSlotAvailabilityInput,
} from './admin.types';
import { Request } from 'express';

export class AdminService {
  // ========== USER MANAGEMENT ==========

  /**
   * Create a new user (Patient, Doctor, or Admin)
   */
  async createUser(data: CreateUserInput, adminId: string, req?: Request) {
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
        role: data.role,
        insuranceProvider: data.insuranceProvider,
        insurancePolicyNumber: data.insurancePolicyNumber,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Log activity
    await logActivity(
      {
        userId: adminId,
        action: 'CREATE_USER',
        entityType: 'User',
        entityId: user.id,
        details: { role: data.role },
      },
      req
    );

    return user;
  }

  /**
   * Get all users with pagination and filters
   */
  async getUsers(query: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  }) {
    const { page = 1, limit = 20, role, isActive, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          dateOfBirth: true,
          address: true,
          insuranceProvider: true,
          insurancePolicyNumber: true,
          isActive: true,
          createdAt: true,
          doctorProfile: {
            select: {
              id: true,
              specialization: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        insuranceProvider: true,
        insurancePolicyNumber: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        doctorProfile: {
          include: {
            department: true,
            availability: true,
          },
        },
        patientAppointments: {
          take: 10,
          orderBy: { appointmentDate: 'desc' },
          include: {
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                doctorProfile: {
                  select: {
                    specialization: true,
                  },
                },
              },
            },
          },
        },
        riskPredictions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        medicalRecords: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: UpdateUserInput, adminId: string, req?: Request) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        address: data.address,
        role: data.role,
        isActive: data.isActive,
        insuranceProvider: data.insuranceProvider,
        insurancePolicyNumber: data.insurancePolicyNumber,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await logActivity(
      {
        userId: adminId,
        action: 'UPDATE_USER',
        entityType: 'User',
        entityId: userId,
        details: data,
      },
      req
    );

    return updated;
  }

  /**
   * Delete user (soft delete by setting isActive to false)
   */
  async deleteUser(userId: string, adminId: string, req?: Request) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Soft delete
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    await logActivity(
      {
        userId: adminId,
        action: 'DELETE_USER',
        entityType: 'User',
        entityId: userId,
      },
      req
    );

    return { message: 'User deactivated successfully' };
  }

  /**
   * Reset user password
   */
  async resetPassword(userId: string, data: ResetPasswordInput, adminId: string, req?: Request) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await logActivity(
      {
        userId: adminId,
        action: 'RESET_PASSWORD',
        entityType: 'User',
        entityId: userId,
      },
      req
    );

    return { message: 'Password reset successfully' };
  }

  // ========== DOCTOR MANAGEMENT ==========

  /**
   * Get all doctors pending approval
   */
  async getPendingDoctors() {
    return prisma.doctor.findMany({
      where: { status: 'PENDING' },
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
        department: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create doctor profile (Admin)
   */
  async createDoctorProfile(data: CreateDoctorProfileInput, adminId: string, req?: Request) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if doctor profile already exists
    const existing = await prisma.doctor.findUnique({
      where: { userId: data.userId },
    });

    if (existing) {
      throw new AppError('Doctor profile already exists for this user', 409);
    }

    // Update user role to DOCTOR if not already
    if (user.role !== 'DOCTOR') {
      await prisma.user.update({
        where: { id: data.userId },
        data: { role: 'DOCTOR' },
      });
    }

    // Create doctor profile
    const doctor = await prisma.doctor.create({
      data: {
        userId: data.userId,
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        yearsOfExperience: data.yearsOfExperience,
        bio: data.bio,
        departmentId: data.departmentId,
        status: 'APPROVED', // Auto-approve when created by admin
        approvedAt: new Date(),
        approvedBy: adminId,
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
        department: true,
      },
    });

    await logActivity(
      {
        userId: adminId,
        action: 'CREATE_DOCTOR_PROFILE',
        entityType: 'Doctor',
        entityId: doctor.id,
        details: { specialization: data.specialization },
      },
      req
    );

    return doctor;
  }

  /**
   * Set doctor slot availability for specific dates (Admin)
   */
  async setDoctorSlotAvailability(data: SetDoctorSlotAvailabilityInput, adminId: string, req?: Request) {
    // Verify doctor exists
    // data.doctorId can be either User ID or Doctor profile ID
    let doctor = await prisma.doctor.findUnique({
      where: { id: data.doctorId },
    });

    // If not found by ID, try finding by userId
    if (!doctor) {
      doctor = await prisma.doctor.findUnique({
        where: { userId: data.doctorId },
      });
    }

    if (!doctor) {
      throw new AppError('Doctor not found. Please create a doctor profile first.', 404);
    }

    // Admin can set slots for any doctor, regardless of approval status
    // If doctor is not approved, auto-approve them when admin sets slots
    if (doctor.status !== 'APPROVED') {
      await prisma.doctor.update({
        where: { id: doctor.id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: adminId,
        },
      });
      // Update local doctor object
      doctor.status = 'APPROVED';
    }

    // Use userId (which is the doctorId in slots table)
    const userId = doctor.userId;

    // Create slots in transaction
    const slots = await prisma.$transaction(
      data.slots.map((slotData: { slotDate: string; startTime: string; endTime: string; maxCapacity: number }) => {
        const slotDate = new Date(slotData.slotDate);
        return prisma.slot.upsert({
          where: {
            doctorId_slotDate_startTime: {
              doctorId: userId,
              slotDate,
              startTime: slotData.startTime,
            },
          },
          update: {
            endTime: slotData.endTime,
            maxCapacity: slotData.maxCapacity,
            isActive: true,
          },
          create: {
            doctorId: userId,
            slotDate,
            startTime: slotData.startTime,
            endTime: slotData.endTime,
            maxCapacity: slotData.maxCapacity,
            isActive: true,
          },
        });
      })
    );

    // Clear cache for affected dates
    const dates = new Set(data.slots.map((s: { slotDate: string }) => new Date(s.slotDate).toISOString().split('T')[0]));
    for (const date of dates) {
      await RedisClient.del(REDIS_KEYS.slotsCache(userId, date as string));
    }

    await logActivity(
      {
        userId: adminId,
        action: 'SET_DOCTOR_SLOT_AVAILABILITY',
        entityType: 'Doctor',
        entityId: data.doctorId,
        details: { slotsCount: slots.length },
      },
      req
    );

    return {
      message: 'Doctor slot availability set successfully',
      slots,
    };
  }

  /**
   * Approve/Reject/Suspend doctor
   */
  async approveDoctor(
    doctorId: string,
    data: ApproveDoctorInput,
    adminId: string,
    req?: Request
  ) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    const updateData: any = {
      status: data.status,
      approvedBy: adminId,
    };

    if (data.status === 'APPROVED') {
      updateData.approvedAt = new Date();
      updateData.rejectionReason = null;
    } else if (data.status === 'REJECTED') {
      updateData.rejectionReason = data.rejectionReason;
    }

    const updated = await prisma.doctor.update({
      where: { id: doctorId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        department: true,
      },
    });

    await logActivity(
      {
        userId: adminId,
        action: `${data.status}_DOCTOR`,
        entityType: 'Doctor',
        entityId: doctorId,
        details: { status: data.status, rejectionReason: data.rejectionReason },
      },
      req
    );

    return updated;
  }

  // ========== DEPARTMENT MANAGEMENT ==========

  /**
   * Create department
   */
  async createDepartment(data: CreateDepartmentInput, adminId: string, req?: Request) {
    const existing = await prisma.department.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new AppError('Department with this name already exists', 409);
    }

    const department = await prisma.department.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    await logActivity(
      {
        userId: adminId,
        action: 'CREATE_DEPARTMENT',
        entityType: 'Department',
        entityId: department.id,
      },
      req
    );

    return department;
  }

  /**
   * Get all departments
   */
  async getDepartments(includeInactive = false) {
    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    return prisma.department.findMany({
      where,
      include: {
        _count: {
          select: { doctors: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Update department
   */
  async updateDepartment(
    departmentId: string,
    data: UpdateDepartmentInput,
    adminId: string,
    req?: Request
  ) {
    const department = await prisma.department.update({
      where: { id: departmentId },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      },
    });

    await logActivity(
      {
        userId: adminId,
        action: 'UPDATE_DEPARTMENT',
        entityType: 'Department',
        entityId: departmentId,
      },
      req
    );

    return department;
  }

  /**
   * Delete department
   */
  async deleteDepartment(departmentId: string, adminId: string, req?: Request) {
    await prisma.department.update({
      where: { id: departmentId },
      data: { isActive: false },
    });

    await logActivity(
      {
        userId: adminId,
        action: 'DELETE_DEPARTMENT',
        entityType: 'Department',
        entityId: departmentId,
      },
      req
    );

    return { message: 'Department deactivated successfully' };
  }

  // ========== TREATMENT CATEGORY MANAGEMENT ==========

  /**
   * Create treatment category
   */
  async createTreatmentCategory(
    data: CreateTreatmentCategoryInput,
    adminId: string,
    req?: Request
  ) {
    const existing = await prisma.treatmentCategory.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new AppError('Treatment category with this name already exists', 409);
    }

    const category = await prisma.treatmentCategory.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    await logActivity(
      {
        userId: adminId,
        action: 'CREATE_TREATMENT_CATEGORY',
        entityType: 'TreatmentCategory',
        entityId: category.id,
      },
      req
    );

    return category;
  }

  /**
   * Get all treatment categories
   */
  async getTreatmentCategories(includeInactive = false) {
    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    return prisma.treatmentCategory.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Update treatment category
   */
  async updateTreatmentCategory(
    categoryId: string,
    data: UpdateTreatmentCategoryInput,
    adminId: string,
    req?: Request
  ) {
    const category = await prisma.treatmentCategory.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      },
    });

    await logActivity(
      {
        userId: adminId,
        action: 'UPDATE_TREATMENT_CATEGORY',
        entityType: 'TreatmentCategory',
        entityId: categoryId,
      },
      req
    );

    return category;
  }

  /**
   * Delete treatment category
   */
  async deleteTreatmentCategory(categoryId: string, adminId: string, req?: Request) {
    await prisma.treatmentCategory.update({
      where: { id: categoryId },
      data: { isActive: false },
    });

    await logActivity(
      {
        userId: adminId,
        action: 'DELETE_TREATMENT_CATEGORY',
        entityType: 'TreatmentCategory',
        entityId: categoryId,
      },
      req
    );

    return { message: 'Treatment category deactivated successfully' };
  }

  // ========== ANALYTICS & REPORTING ==========

  /**
   * Get dashboard analytics
   */
  async getDashboardAnalytics(query: AnalyticsQuery) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = startDate;
      if (endDate) dateFilter.createdAt.lte = endDate;
    }

    // Calculate monthly new patients (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyPatientFilter = {
      role: 'PATIENT' as const,
      createdAt: {
        gte: thirtyDaysAgo,
      },
    };

    const [
      totalUsers,
      totalPatients,
      monthlyNewPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      totalRevenue,
      pendingDoctors,
      activeDoctors,
      totalRiskAssessments,
    ] = await Promise.all([
      prisma.user.count({ where: dateFilter }),
      prisma.user.count({ where: { role: 'PATIENT', ...dateFilter } }),
      prisma.user.count({ where: monthlyPatientFilter }),
      prisma.user.count({ where: { role: 'DOCTOR', ...dateFilter } }),
      prisma.appointment.count({ where: dateFilter }),
      prisma.appointment.count({ where: { status: 'PENDING', ...dateFilter } }),
      prisma.appointment.count({ where: { status: 'COMPLETED', ...dateFilter } }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED', ...dateFilter },
        _sum: { amount: true },
      }),
      prisma.doctor.count({ where: { status: 'PENDING' } }),
      prisma.doctor.count({ where: { status: 'APPROVED', isAvailable: true } }),
      prisma.riskPrediction.count({ where: dateFilter }),
    ]);

    // Recent appointments
    const recentAppointments = await prisma.appointment.findMany({
      where: dateFilter,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            doctorProfile: {
              select: {
                specialization: true,
              },
            },
          },
        },
      },
    });

    // Risk level distribution
    const riskDistribution = await prisma.riskPrediction.groupBy({
      by: ['riskLevel'],
      where: dateFilter,
      _count: true,
    });

    return {
      overview: {
        totalUsers,
        totalPatients,
        monthlyNewPatients,
        totalDoctors,
        activeDoctors,
        pendingDoctors,
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalRiskAssessments,
      },
      riskDistribution: riskDistribution.map((r) => ({
        riskLevel: r.riskLevel,
        count: r._count,
      })),
      recentAppointments,
    };
  }

  /**
   * Get appointment statistics
   */
  async getAppointmentStats(query: AnalyticsQuery) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.appointmentDate = {};
      if (startDate) dateFilter.appointmentDate.gte = startDate;
      if (endDate) dateFilter.appointmentDate.lte = endDate;
    }

    const stats = await prisma.appointment.groupBy({
      by: ['status'],
      where: dateFilter,
      _count: true,
    });

    return stats.map((s) => ({
      status: s.status,
      count: s._count,
    }));
  }

  /**
   * Get revenue statistics
   */
  async getRevenueStats(query: AnalyticsQuery) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = startDate;
      if (endDate) dateFilter.createdAt.lte = endDate;
    }

    const [total, byStatus, byMethod] = await Promise.all([
      prisma.payment.aggregate({
        where: { ...dateFilter },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.groupBy({
        by: ['status'],
        where: dateFilter,
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        where: { status: 'COMPLETED', ...dateFilter },
        _sum: { amount: true },
      }),
    ]);

    return {
      total: {
        amount: total._sum.amount || 0,
        count: total._count,
      },
      byStatus: byStatus.map((s) => ({
        status: s.status,
        amount: s._sum.amount || 0,
        count: s._count,
      })),
      byMethod: byMethod.map((m) => ({
        method: m.paymentMethod,
        amount: m._sum.amount || 0,
      })),
    };
  }

  /**
   * Mark patient attendance for an appointment
   */
  async markAttendance(appointmentId: string, data: UpdateAttendanceInput, adminId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        attendanceStatus: data.attendanceStatus,
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

    await logActivity({
      userId: adminId,
      action: 'UPDATE_APPOINTMENT_ATTENDANCE',
      entityType: 'Appointment',
      entityId: appointmentId,
      details: {
        attendanceStatus: data.attendanceStatus,
        patientId: appointment.patientId,
      },
    });

    return updated;
  }

  /**
   * Update patient risk level
   */
  async updatePatientRiskLevel(patientId: string, data: UpdateRiskLevelInput, adminId: string) {
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
    });

    if (!patient || patient.role !== 'PATIENT') {
      throw new AppError('Patient not found', 404);
    }

    // Create a new risk prediction record
    const latestRisk = await prisma.riskPrediction.findFirst({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestRisk) {
      throw new AppError('No risk prediction found for this patient', 404);
    }

    // Create new risk prediction with updated level
    const newRiskPrediction = await prisma.riskPrediction.create({
      data: {
        patientId,
        age: latestRisk.age,
        systolicBp: latestRisk.systolicBp,
        diastolicBp: latestRisk.diastolicBp,
        bloodSugar: latestRisk.bloodSugar,
        bodyTemp: latestRisk.bodyTemp,
        bmi: latestRisk.bmi,
        previousComplications: latestRisk.previousComplications,
        preexistingDiabetes: latestRisk.preexistingDiabetes,
        gestationalDiabetes: latestRisk.gestationalDiabetes,
        mentalHealth: latestRisk.mentalHealth,
        heartRate: latestRisk.heartRate,
        bpDiff: latestRisk.bpDiff,
        bmiCat: latestRisk.bmiCat,
        highBp: latestRisk.highBp,
        highHr: latestRisk.highHr,
        riskFactors: latestRisk.riskFactors,
        riskLevel: data.riskLevel,
        confidence: 1.0, // Admin override
        explanation: `Risk level updated by admin`,
      },
    });

    // Update all pending appointments to reflect priority
    await prisma.appointment.updateMany({
      where: {
        patientId,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      data: {
        isPriority: data.riskLevel === 'HIGH',
        riskScore: data.riskLevel,
      },
    });

    await logActivity({
      userId: adminId,
      action: 'UPDATE_PATIENT_RISK_LEVEL',
      entityType: 'User',
      entityId: patientId,
      details: {
        riskLevel: data.riskLevel,
        previousRiskLevel: latestRisk.riskLevel,
      },
    });

    return {
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
      },
      riskLevel: data.riskLevel,
      riskPrediction: newRiskPrediction,
    };
  }

  /**
   * Get all bookings for a specific slot
   */
  async getSlotBookings(slotId: string) {
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
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
      slot: {
        id: slot.id,
        slotDate: slot.slotDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        maxCapacity: slot.maxCapacity,
        currentBookings: slot.currentBookings,
        availableSpots: slot.maxCapacity - slot.currentBookings,
        isFull: slot.currentBookings >= slot.maxCapacity,
        doctor: slot.doctor,
        appointments: slot.appointments.map((apt) => ({
          id: apt.id,
          patient: apt.patient,
          status: apt.status,
          bookingStatus: apt.bookingStatus,
          attendanceStatus: apt.attendanceStatus,
          isPriority: apt.isPriority,
          riskScore: apt.riskScore,
          notes: apt.notes,
          createdAt: apt.createdAt,
        })),
      },
    };
  }
}

export const adminService = new AdminService();


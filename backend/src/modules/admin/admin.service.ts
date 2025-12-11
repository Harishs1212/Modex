import bcrypt from 'bcrypt';
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { logActivity } from '../../utils/activityLogger';
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

    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      totalRevenue,
      pendingDoctors,
      activeDoctors,
    ] = await Promise.all([
      prisma.user.count({ where: dateFilter }),
      prisma.user.count({ where: { role: 'PATIENT', ...dateFilter } }),
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
        totalDoctors,
        activeDoctors,
        pendingDoctors,
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        totalRevenue: totalRevenue._sum.amount || 0,
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
}

export const adminService = new AdminService();


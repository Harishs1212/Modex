import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { logActivity } from '../../utils/activityLogger';
import { CreatePaymentInput, UpdatePaymentInput } from './payment.types';
import { Request } from 'express';

export class PaymentService {
  /**
   * Generate invoice number
   */
  private generateInvoiceNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `INV-${timestamp}-${random}`;
  }

  /**
   * Create a new payment
   */
  async createPayment(data: CreatePaymentInput, userId: string, req?: Request) {
    // Verify patient exists
    const patient = await prisma.user.findUnique({
      where: { id: data.patientId },
    });

    if (!patient || patient.role !== 'PATIENT') {
      throw new AppError('Patient not found', 404);
    }

    // If appointmentId provided, verify it exists
    if (data.appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: data.appointmentId },
      });

      if (!appointment) {
        throw new AppError('Appointment not found', 404);
      }

      if (appointment.patientId !== data.patientId) {
        throw new AppError('Appointment does not belong to this patient', 403);
      }

      // Check if payment already exists for this appointment
      const existingPayment = await prisma.payment.findUnique({
        where: { appointmentId: data.appointmentId },
      });

      if (existingPayment) {
        throw new AppError('Payment already exists for this appointment', 409);
      }
    }

    const invoiceNumber = this.generateInvoiceNumber();

    const payment = await prisma.payment.create({
      data: {
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        amount: data.amount,
        status: 'PENDING',
        paymentMethod: data.paymentMethod,
        invoiceNumber,
        description: data.description,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            startTime: true,
          },
        },
      },
    });

    await logActivity(
      {
        userId,
        action: 'CREATE_PAYMENT',
        entityType: 'Payment',
        entityId: payment.id,
        details: { amount: data.amount, paymentMethod: data.paymentMethod },
      },
      req
    );

    return payment;
  }

  /**
   * Get payments for a patient
   */
  async getPatientPayments(patientId: string, status?: string) {
    const where: any = { patientId };
    if (status) {
      where.status = status;
    }

    return prisma.payment.findMany({
      where,
      include: {
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            startTime: true,
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
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string, userId: string, userRole: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
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
        appointment: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    // Check permissions
    if (userRole === 'PATIENT' && payment.patientId !== userId) {
      throw new AppError('Unauthorized to view this payment', 403);
    }

    return payment;
  }

  /**
   * Update payment (mark as completed, etc.)
   */
  async updatePayment(
    paymentId: string,
    data: UpdatePaymentInput,
    userId: string,
    userRole: string,
    req?: Request
  ) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    // Only admin or the patient can update payment
    if (userRole === 'PATIENT' && payment.patientId !== userId) {
      throw new AppError('Unauthorized to update this payment', 403);
    }

    const updateData: any = {};
    if (data.status) {
      updateData.status = data.status;
      if (data.status === 'COMPLETED') {
        updateData.paidAt = new Date();
      }
    }
    if (data.transactionId) {
      updateData.transactionId = data.transactionId;
    }
    if (data.invoiceNumber) {
      updateData.invoiceNumber = data.invoiceNumber;
    }

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
          },
        },
      },
    });

    await logActivity(
      {
        userId,
        action: 'UPDATE_PAYMENT',
        entityType: 'Payment',
        entityId: paymentId,
        details: updateData,
      },
      req
    );

    return updated;
  }

  /**
   * Get payment statistics for a patient
   */
  async getPaymentStats(patientId: string) {
    const [total, byStatus, byMethod] = await Promise.all([
      prisma.payment.aggregate({
        where: { patientId },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.groupBy({
        by: ['status'],
        where: { patientId },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        where: { patientId, status: 'COMPLETED' },
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

export const paymentService = new PaymentService();


import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { logActivity } from '../../utils/activityLogger';
import { CreatePrescriptionInput, UpdatePrescriptionInput } from './prescription.types';
import { Request } from 'express';

export class PrescriptionService {
  /**
   * Create a new prescription
   */
  async createPrescription(
    doctorId: string,
    data: CreatePrescriptionInput,
    req?: Request
  ) {
    // Verify patient exists
    const patient = await prisma.user.findUnique({
      where: { id: data.patientId },
    });

    if (!patient || patient.role !== 'PATIENT') {
      throw new AppError('Patient not found', 404);
    }

    // Verify doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    // If appointmentId provided, verify it exists
    if (data.appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: data.appointmentId },
      });

      if (!appointment) {
        throw new AppError('Appointment not found', 404);
      }

      if (appointment.patientId !== data.patientId || appointment.doctorId !== doctor.userId) {
        throw new AppError('Appointment does not match patient or doctor', 403);
      }
    }

    const prescription = await prisma.prescription.create({
      data: {
        patientId: data.patientId,
        doctorId: doctorId,
        appointmentId: data.appointmentId,
        medications: data.medications as any,
        notes: data.notes,
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
        doctor: {
          include: {
            user: {
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

    await logActivity(
      {
        userId: doctor.userId,
        action: 'CREATE_PRESCRIPTION',
        entityType: 'Prescription',
        entityId: prescription.id,
        details: { patientId: data.patientId, medicationCount: data.medications.length },
      },
      req
    );

    return prescription;
  }

  /**
   * Get prescriptions for a patient
   */
  async getPatientPrescriptions(patientId: string, includeInactive = false) {
    const where: any = { patientId };
    if (!includeInactive) {
      where.isActive = true;
    }

    return prisma.prescription.findMany({
      where,
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get prescription by ID
   */
  async getPrescriptionById(prescriptionId: string, userId: string, userRole: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
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
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    // Check permissions
    if (userRole === 'PATIENT' && prescription.patientId !== userId) {
      throw new AppError('Unauthorized to view this prescription', 403);
    }

    if (userRole === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({
        where: { userId },
      });
      if (!doctor || prescription.doctorId !== doctor.id) {
        throw new AppError('Unauthorized to view this prescription', 403);
      }
    }

    return prescription;
  }

  /**
   * Update prescription
   */
  async updatePrescription(
    prescriptionId: string,
    doctorId: string,
    data: UpdatePrescriptionInput,
    req?: Request
  ) {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });

    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    // Verify doctor owns this prescription
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor || prescription.doctorId !== doctorId) {
      throw new AppError('Unauthorized to update this prescription', 403);
    }

    const updated = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        medications: data.medications as any,
        notes: data.notes,
        isActive: data.isActive,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        doctor: {
          include: {
            user: {
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

    await logActivity(
      {
        userId: doctor.userId,
        action: 'UPDATE_PRESCRIPTION',
        entityType: 'Prescription',
        entityId: prescriptionId,
      },
      req
    );

    return updated;
  }
}

export const prescriptionService = new PrescriptionService();


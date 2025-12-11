import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { logActivity } from '../../utils/activityLogger';
import { CreateMedicalRecordInput, UpdateMedicalRecordInput } from './medical-record.types';
import { Request } from 'express';

export class MedicalRecordService {
  /**
   * Create a new medical record
   */
  async createMedicalRecord(
    doctorId: string,
    data: CreateMedicalRecordInput,
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

    // If appointmentId provided, verify it exists and belongs to this doctor/patient
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

    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        patientId: data.patientId,
        doctorId: doctorId,
        appointmentId: data.appointmentId,
        recordType: data.recordType,
        diagnosis: data.diagnosis,
        notes: data.notes,
        labResults: data.labResults as any,
        treatmentPlan: data.treatmentPlan,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        attachments: data.attachments as any,
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
        userId: doctor.userId,
        action: 'CREATE_MEDICAL_RECORD',
        entityType: 'MedicalRecord',
        entityId: medicalRecord.id,
        details: { recordType: data.recordType, patientId: data.patientId },
      },
      req
    );

    return medicalRecord;
  }

  /**
   * Get medical records for a patient
   */
  async getPatientRecords(patientId: string, doctorId?: string) {
    const where: any = { patientId };
    if (doctorId) {
      where.doctorId = doctorId;
    }

    return prisma.medicalRecord.findMany({
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
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            startTime: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get medical record by ID
   */
  async getMedicalRecordById(recordId: string, userId: string, userRole: string) {
    const record = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
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

    if (!record) {
      throw new AppError('Medical record not found', 404);
    }

    // Check permissions: Patient can only see their own records, Doctor can see their records, Admin can see all
    if (userRole === 'PATIENT' && record.patientId !== userId) {
      throw new AppError('Unauthorized to view this record', 403);
    }

    if (userRole === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({
        where: { userId },
      });
      if (!doctor || record.doctorId !== doctor.id) {
        throw new AppError('Unauthorized to view this record', 403);
      }
    }

    return record;
  }

  /**
   * Update medical record
   */
  async updateMedicalRecord(
    recordId: string,
    doctorId: string,
    data: UpdateMedicalRecordInput,
    req?: Request
  ) {
    const record = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new AppError('Medical record not found', 404);
    }

    // Verify doctor owns this record
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor || record.doctorId !== doctorId) {
      throw new AppError('Unauthorized to update this record', 403);
    }

    const updated = await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        diagnosis: data.diagnosis,
        notes: data.notes,
        labResults: data.labResults as any,
        treatmentPlan: data.treatmentPlan,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
        attachments: data.attachments as any,
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
        action: 'UPDATE_MEDICAL_RECORD',
        entityType: 'MedicalRecord',
        entityId: recordId,
      },
      req
    );

    return updated;
  }

  /**
   * Get patient medical history summary
   */
  async getPatientHistory(patientId: string) {
    const [records, prescriptions, appointments, riskPredictions] = await Promise.all([
      prisma.medicalRecord.findMany({
        where: { patientId },
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      prisma.prescription.findMany({
        where: { patientId, isActive: true },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      prisma.appointment.findMany({
        where: { patientId },
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
      }),
      prisma.riskPrediction.findMany({
        where: { patientId },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      records,
      prescriptions,
      appointments,
      riskPredictions,
    };
  }
}

export const medicalRecordService = new MedicalRecordService();


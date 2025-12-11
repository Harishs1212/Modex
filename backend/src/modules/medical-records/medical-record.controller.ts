import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { medicalRecordService } from './medical-record.service';
import { asyncHandler } from '../../utils/asyncHandler';
import prisma from '../../config/database';

export class MedicalRecordController {
  createMedicalRecord = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    // Get doctor ID from user
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.userId! },
    });

    if (!doctor) {
      res.status(403).json({ error: 'Only doctors can create medical records' });
      return;
    }

    const record = await medicalRecordService.createMedicalRecord(doctor.id, req.body, req);
    res.status(201).json({
      message: 'Medical record created successfully',
      record,
    });
  });

  getPatientRecords = asyncHandler(async (req: AuthRequest, res: Response) => {
    const patientId = req.params.patientId || req.userId!;
    const doctorId = req.query.doctorId as string | undefined;

    // If doctor is requesting, get their doctor profile
    let actualDoctorId = doctorId;
    if (req.userRole === 'DOCTOR' && !doctorId) {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: req.userId! },
      });
      if (doctor) {
        actualDoctorId = doctor.id;
      }
    }

    const records = await medicalRecordService.getPatientRecords(patientId, actualDoctorId);
    res.json({ records });
  });

  getMedicalRecordById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const record = await medicalRecordService.getMedicalRecordById(
      req.params.recordId,
      req.userId!,
      req.userRole!
    );
    res.json({ record });
  });

  updateMedicalRecord = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.userId! },
    });

    if (!doctor) {
      res.status(403).json({ error: 'Only doctors can update medical records' });
      return;
    }

    const record = await medicalRecordService.updateMedicalRecord(
      req.params.recordId,
      doctor.id,
      req.body,
      req
    );
    res.json({
      message: 'Medical record updated successfully',
      record,
    });
  });

  getPatientHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const patientId = req.params.patientId || req.userId!;
    const history = await medicalRecordService.getPatientHistory(patientId);
    res.json(history);
  });
}

export const medicalRecordController = new MedicalRecordController();


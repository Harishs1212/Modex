import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { prescriptionService } from './prescription.service';
import { asyncHandler } from '../../utils/asyncHandler';
import prisma from '../../config/database';

export class PrescriptionController {
  createPrescription = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.userId! },
    });

    if (!doctor) {
      res.status(403).json({ error: 'Only doctors can create prescriptions' });
      return;
    }

    const prescription = await prescriptionService.createPrescription(doctor.id, req.body, req);
    res.status(201).json({
      message: 'Prescription created successfully',
      prescription,
    });
  });

  getPatientPrescriptions = asyncHandler(async (req: AuthRequest, res: Response) => {
    const patientId = req.params.patientId || req.userId!;
    const includeInactive = req.query.includeInactive === 'true';
    const prescriptions = await prescriptionService.getPatientPrescriptions(patientId, includeInactive);
    res.json({ prescriptions });
  });

  getPrescriptionById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const prescription = await prescriptionService.getPrescriptionById(
      req.params.prescriptionId,
      req.userId!,
      req.userRole!
    );
    res.json({ prescription });
  });

  updatePrescription = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.userId! },
    });

    if (!doctor) {
      res.status(403).json({ error: 'Only doctors can update prescriptions' });
      return;
    }

    const prescription = await prescriptionService.updatePrescription(
      req.params.prescriptionId,
      doctor.id,
      req.body,
      req
    );
    res.json({
      message: 'Prescription updated successfully',
      prescription,
    });
  });
}

export const prescriptionController = new PrescriptionController();


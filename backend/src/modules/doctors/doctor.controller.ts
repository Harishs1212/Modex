import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { doctorService } from './doctor.service';

export class DoctorController {
  async createDoctor(req: AuthRequest, res: Response): Promise<void> {
    const doctor = await doctorService.createDoctor(req.body);
    res.status(201).json({
      message: 'Doctor profile created successfully',
      doctor,
    });
  }

  async getDoctors(req: AuthRequest, res: Response): Promise<void> {
    const result = await doctorService.getDoctors(req.query as any);
    res.json(result);
  }

  async getDoctorById(req: AuthRequest, res: Response): Promise<void> {
    const doctor = await doctorService.getDoctorById(req.params.id);
    res.json(doctor);
  }

  async updateAvailability(req: AuthRequest, res: Response): Promise<void> {
    const result = await doctorService.updateAvailability(req.params.id, req.body);
    res.json(result);
  }
}

export const doctorController = new DoctorController();


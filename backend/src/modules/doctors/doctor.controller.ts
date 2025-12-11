import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { doctorService } from './doctor.service';
import { GetDoctorsQuery } from './doctor.types';

export class DoctorController {
  async createDoctor(req: AuthRequest, res: Response): Promise<void> {
    const doctor = await doctorService.createDoctor(req.body);
    res.status(201).json({
      message: 'Doctor profile created successfully',
      doctor,
    });
  }

  async getDoctors(req: AuthRequest, res: Response): Promise<void> {
    // The validation middleware should have already transformed the query
    // But we ensure defaults are set for safety
    const query: GetDoctorsQuery = {
      page: (req.query as any).page ?? 1,
      limit: (req.query as any).limit ?? 10,
      specialization: (req.query as any).specialization,
      isAvailable: (req.query as any).isAvailable,
    };
    const result = await doctorService.getDoctors(query);
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

  async getAvailableDoctorsForDate(req: AuthRequest, res: Response): Promise<void> {
    const { date } = req.query;
    if (!date || typeof date !== 'string') {
      res.status(400).json({ error: 'Date parameter is required (YYYY-MM-DD format)' });
      return;
    }
    const doctors = await doctorService.getAvailableDoctorsForDate(date);
    res.json({ doctors });
  }
}

export const doctorController = new DoctorController();


import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { appointmentService } from './appointment.service';
import { getAvailableSlots } from './slot.engine';
import prisma from '../../config/database';

export class AppointmentController {
  async createAppointment(req: AuthRequest, res: Response): Promise<void> {
    const appointment = await appointmentService.createAppointment(req.userId!, req.body);
    res.status(201).json({
      message: 'Appointment created successfully',
      appointment,
    });
  }

  async getAppointments(req: AuthRequest, res: Response): Promise<void> {
    const result = await appointmentService.getAppointments(
      req.userId!,
      req.userRole!,
      req.query as any
    );
    res.json(result);
  }

  async getSlots(req: AuthRequest, res: Response): Promise<void> {
    const { doctorId, date } = req.query;
    const dateObj = new Date(date as string);
    const slots = await getAvailableSlots(doctorId as string, dateObj);
    res.json({ slots });
  }

  async updateAppointment(req: AuthRequest, res: Response): Promise<void> {
    const appointment = await appointmentService.updateAppointment(
      req.params.id,
      req.userId!,
      req.userRole!,
      req.body
    );
    res.json({
      message: 'Appointment updated successfully',
      appointment,
    });
  }

  async cancelAppointment(req: AuthRequest, res: Response): Promise<void> {
    const appointment = await appointmentService.cancelAppointment(
      req.params.id,
      req.userId!,
      req.userRole!
    );
    res.json({
      message: 'Appointment cancelled successfully',
      appointment,
    });
  }

  async acceptAppointment(req: AuthRequest, res: Response): Promise<void> {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.userId! },
    });

    if (!doctor) {
      res.status(403).json({ error: 'Only doctors can accept appointments' });
      return;
    }

    const appointment = await appointmentService.acceptAppointment(
      req.params.id,
      doctor.id
    );
    res.json({
      message: 'Appointment accepted successfully',
      appointment,
    });
  }

  async declineAppointment(req: AuthRequest, res: Response): Promise<void> {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.userId! },
    });

    if (!doctor) {
      res.status(403).json({ error: 'Only doctors can decline appointments' });
      return;
    }

    const appointment = await appointmentService.declineAppointment(
      req.params.id,
      doctor.id,
      req.body.reason
    );
    res.json({
      message: 'Appointment declined successfully',
      appointment,
    });
  }

  async completeAppointment(req: AuthRequest, res: Response): Promise<void> {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.userId! },
    });

    if (!doctor) {
      res.status(403).json({ error: 'Only doctors can complete appointments' });
      return;
    }

    const appointment = await appointmentService.completeAppointment(
      req.params.id,
      doctor.id
    );
    res.json({
      message: 'Appointment marked as completed',
      appointment,
    });
  }

  async markMissedAppointment(req: AuthRequest, res: Response): Promise<void> {
    const appointment = await appointmentService.markMissedAppointment(
      req.params.id,
      req.userId!,
      req.userRole!
    );
    res.json({
      message: 'Appointment marked as missed',
      appointment,
    });
  }
}

export const appointmentController = new AppointmentController();


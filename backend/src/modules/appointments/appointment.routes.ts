import { Router } from 'express';
import { appointmentController } from './appointment.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  getAppointmentsQuerySchema,
  getSlotsQuerySchema,
} from './appointment.types';

const router = Router();

router.post(
  '/',
  authenticate,
  validate(createAppointmentSchema),
  appointmentController.createAppointment.bind(appointmentController)
);

router.get(
  '/',
  authenticate,
  validate(getAppointmentsQuerySchema),
  appointmentController.getAppointments.bind(appointmentController)
);

router.get(
  '/slots',
  validate(getSlotsQuerySchema),
  appointmentController.getSlots.bind(appointmentController)
);

router.put(
  '/:id',
  authenticate,
  validate(updateAppointmentSchema),
  appointmentController.updateAppointment.bind(appointmentController)
);

router.delete(
  '/:id',
  authenticate,
  appointmentController.cancelAppointment.bind(appointmentController)
);

router.post(
  '/:id/accept',
  authenticate,
  appointmentController.acceptAppointment.bind(appointmentController)
);

router.post(
  '/:id/decline',
  authenticate,
  appointmentController.declineAppointment.bind(appointmentController)
);

router.post(
  '/:id/complete',
  authenticate,
  appointmentController.completeAppointment.bind(appointmentController)
);

router.post(
  '/:id/missed',
  authenticate,
  appointmentController.markMissedAppointment.bind(appointmentController)
);

export default router;


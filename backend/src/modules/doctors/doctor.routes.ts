import { Router } from 'express';
import { doctorController } from './doctor.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  createDoctorSchema,
  updateAvailabilitySchema,
  getDoctorsQuerySchema,
} from './doctor.types';
import { USER_ROLES } from '../../utils/constants';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(createDoctorSchema),
  doctorController.createDoctor.bind(doctorController)
);

router.get(
  '/',
  validate(getDoctorsQuerySchema),
  doctorController.getDoctors.bind(doctorController)
);

router.get(
  '/available',
  doctorController.getAvailableDoctorsForDate.bind(doctorController)
);

router.get(
  '/:id',
  doctorController.getDoctorById.bind(doctorController)
);

router.put(
  '/:id/availability',
  authenticate,
  authorize(USER_ROLES.DOCTOR, USER_ROLES.ADMIN),
  validate(updateAvailabilitySchema),
  doctorController.updateAvailability.bind(doctorController)
);

export default router;


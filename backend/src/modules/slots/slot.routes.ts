import { Router } from 'express';
import { SlotController } from './slot.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  createSlotSchema,
  updateSlotSchema,
  getSlotsQuerySchema,
  bookSlotSchema,
  movePatientSchema,
} from './slot.types';
import { USER_ROLES } from '../../utils/constants';

const router = Router();
const controller = new SlotController();

// Public route - Get available slots
router.get(
  '/available',
  validate(getSlotsQuerySchema),
  controller.getAvailableSlots
);

// Patient routes
router.post(
  '/book',
  authenticate,
  authorize(USER_ROLES.PATIENT),
  validate(bookSlotSchema),
  controller.bookSlot
);

// Doctor/Admin routes - Slot management
router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.DOCTOR),
  validate(createSlotSchema),
  controller.createSlot
);

router.get(
  '/',
  authenticate,
  validate(getSlotsQuerySchema),
  controller.getSlots
);

router.get(
  '/:id',
  authenticate,
  controller.getSlotById
);

router.patch(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.DOCTOR),
  validate(updateSlotSchema),
  controller.updateSlot
);

router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.DOCTOR),
  controller.deleteSlot
);

// Admin only - Move patient
router.post(
  '/move-patient',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(movePatientSchema),
  controller.movePatientToSlot
);

export default router;


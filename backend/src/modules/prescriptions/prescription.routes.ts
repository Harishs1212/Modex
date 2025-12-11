import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { prescriptionController } from './prescription.controller';
import { CreatePrescriptionSchema, UpdatePrescriptionSchema } from './prescription.types';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     summary: Create prescription (Doctor only)
 *     tags: [Prescriptions]
 */
router.post(
  '/',
  authorize('DOCTOR', 'ADMIN'),
  validate(CreatePrescriptionSchema),
  prescriptionController.createPrescription
);

/**
 * @swagger
 * /api/prescriptions/patient/:patientId:
 *   get:
 *     summary: Get patient prescriptions
 *     tags: [Prescriptions]
 */
router.get('/patient/:patientId', prescriptionController.getPatientPrescriptions);
router.get('/patient', prescriptionController.getPatientPrescriptions);

/**
 * @swagger
 * /api/prescriptions/:prescriptionId:
 *   get:
 *     summary: Get prescription by ID
 *     tags: [Prescriptions]
 */
router.get('/:prescriptionId', prescriptionController.getPrescriptionById);

/**
 * @swagger
 * /api/prescriptions/:prescriptionId:
 *   put:
 *     summary: Update prescription (Doctor only)
 *     tags: [Prescriptions]
 */
router.put(
  '/:prescriptionId',
  authorize('DOCTOR', 'ADMIN'),
  validate(UpdatePrescriptionSchema),
  prescriptionController.updatePrescription
);

export default router;


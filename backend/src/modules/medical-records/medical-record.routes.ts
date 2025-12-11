import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { medicalRecordController } from './medical-record.controller';
import { CreateMedicalRecordSchema, UpdateMedicalRecordSchema } from './medical-record.types';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/medical-records:
 *   post:
 *     summary: Create medical record (Doctor only)
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authorize('DOCTOR', 'ADMIN'),
  validate(CreateMedicalRecordSchema),
  medicalRecordController.createMedicalRecord
);

/**
 * @swagger
 * /api/medical-records/patient/:patientId:
 *   get:
 *     summary: Get patient medical records
 *     tags: [Medical Records]
 */
router.get('/patient/:patientId', medicalRecordController.getPatientRecords);
router.get('/patient', medicalRecordController.getPatientRecords); // For current user

/**
 * @swagger
 * /api/medical-records/:recordId:
 *   get:
 *     summary: Get medical record by ID
 *     tags: [Medical Records]
 */
router.get('/:recordId', medicalRecordController.getMedicalRecordById);

/**
 * @swagger
 * /api/medical-records/:recordId:
 *   put:
 *     summary: Update medical record (Doctor only)
 *     tags: [Medical Records]
 */
router.put(
  '/:recordId',
  authorize('DOCTOR', 'ADMIN'),
  validate(UpdateMedicalRecordSchema),
  medicalRecordController.updateMedicalRecord
);

/**
 * @swagger
 * /api/medical-records/patient/:patientId/history:
 *   get:
 *     summary: Get patient complete medical history
 *     tags: [Medical Records]
 */
router.get('/patient/:patientId/history', medicalRecordController.getPatientHistory);
router.get('/patient/history', medicalRecordController.getPatientHistory); // For current user

export default router;


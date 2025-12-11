import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { paymentController } from './payment.controller';
import { CreatePaymentSchema, UpdatePaymentSchema } from './payment.types';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Create payment
 *     tags: [Payments]
 */
router.post(
  '/',
  validate(CreatePaymentSchema),
  paymentController.createPayment
);

/**
 * @swagger
 * /api/payments/patient/:patientId:
 *   get:
 *     summary: Get patient payments
 *     tags: [Payments]
 */
router.get('/patient/:patientId', paymentController.getPatientPayments);
router.get('/patient', paymentController.getPatientPayments);

/**
 * @swagger
 * /api/payments/:paymentId:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 */
router.get('/:paymentId', paymentController.getPaymentById);

/**
 * @swagger
 * /api/payments/:paymentId:
 *   put:
 *     summary: Update payment
 *     tags: [Payments]
 */
router.put(
  '/:paymentId',
  validate(UpdatePaymentSchema),
  paymentController.updatePayment
);

/**
 * @swagger
 * /api/payments/patient/:patientId/stats:
 *   get:
 *     summary: Get payment statistics
 *     tags: [Payments]
 */
router.get('/patient/:patientId/stats', paymentController.getPaymentStats);
router.get('/patient/stats', paymentController.getPaymentStats);

export default router;


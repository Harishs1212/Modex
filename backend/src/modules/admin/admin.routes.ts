import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { adminController } from './admin.controller';
import {
  CreateUserSchema,
  UpdateUserSchema,
  ResetPasswordSchema,
  ApproveDoctorSchema,
  CreateDepartmentSchema,
  UpdateDepartmentSchema,
  CreateTreatmentCategorySchema,
  UpdateTreatmentCategorySchema,
} from './admin.types';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// ========== USER MANAGEMENT ==========
/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [PATIENT, DOCTOR, ADMIN]
 */
router.post('/users', validate(CreateUserSchema), adminController.createUser);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with pagination (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/users', adminController.getUsers);

/**
 * @swagger
 * /api/admin/users/:userId:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Admin]
 */
router.get('/users/:userId', adminController.getUserById);

/**
 * @swagger
 * /api/admin/users/:userId:
 *   put:
 *     summary: Update user (Admin only)
 *     tags: [Admin]
 */
router.put('/users/:userId', validate(UpdateUserSchema), adminController.updateUser);

/**
 * @swagger
 * /api/admin/users/:userId:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Admin]
 */
router.delete('/users/:userId', adminController.deleteUser);

/**
 * @swagger
 * /api/admin/users/:userId/reset-password:
 *   post:
 *     summary: Reset user password (Admin only)
 *     tags: [Admin]
 */
router.post('/users/:userId/reset-password', validate(ResetPasswordSchema), adminController.resetPassword);

// ========== DOCTOR MANAGEMENT ==========
/**
 * @swagger
 * /api/admin/doctors/pending:
 *   get:
 *     summary: Get all pending doctors (Admin only)
 *     tags: [Admin]
 */
router.get('/doctors/pending', adminController.getPendingDoctors);

/**
 * @swagger
 * /api/admin/doctors/:doctorId/approve:
 *   post:
 *     summary: Approve/Reject/Suspend doctor (Admin only)
 *     tags: [Admin]
 */
router.post('/doctors/:doctorId/approve', validate(ApproveDoctorSchema), adminController.approveDoctor);

// ========== DEPARTMENT MANAGEMENT ==========
/**
 * @swagger
 * /api/admin/departments:
 *   post:
 *     summary: Create department (Admin only)
 *     tags: [Admin]
 */
router.post('/departments', validate(CreateDepartmentSchema), adminController.createDepartment);

/**
 * @swagger
 * /api/admin/departments:
 *   get:
 *     summary: Get all departments (Admin only)
 *     tags: [Admin]
 */
router.get('/departments', adminController.getDepartments);

/**
 * @swagger
 * /api/admin/departments/:departmentId:
 *   put:
 *     summary: Update department (Admin only)
 *     tags: [Admin]
 */
router.put('/departments/:departmentId', validate(UpdateDepartmentSchema), adminController.updateDepartment);

/**
 * @swagger
 * /api/admin/departments/:departmentId:
 *   delete:
 *     summary: Delete department (Admin only)
 *     tags: [Admin]
 */
router.delete('/departments/:departmentId', adminController.deleteDepartment);

// ========== TREATMENT CATEGORY MANAGEMENT ==========
/**
 * @swagger
 * /api/admin/treatment-categories:
 *   post:
 *     summary: Create treatment category (Admin only)
 *     tags: [Admin]
 */
router.post('/treatment-categories', validate(CreateTreatmentCategorySchema), adminController.createTreatmentCategory);

/**
 * @swagger
 * /api/admin/treatment-categories:
 *   get:
 *     summary: Get all treatment categories (Admin only)
 *     tags: [Admin]
 */
router.get('/treatment-categories', adminController.getTreatmentCategories);

/**
 * @swagger
 * /api/admin/treatment-categories/:categoryId:
 *   put:
 *     summary: Update treatment category (Admin only)
 *     tags: [Admin]
 */
router.put('/treatment-categories/:categoryId', validate(UpdateTreatmentCategorySchema), adminController.updateTreatmentCategory);

/**
 * @swagger
 * /api/admin/treatment-categories/:categoryId:
 *   delete:
 *     summary: Delete treatment category (Admin only)
 *     tags: [Admin]
 */
router.delete('/treatment-categories/:categoryId', adminController.deleteTreatmentCategory);

// ========== ANALYTICS & REPORTING ==========
/**
 * @swagger
 * /api/admin/analytics/dashboard:
 *   get:
 *     summary: Get dashboard analytics (Admin only)
 *     tags: [Admin]
 */
router.get('/analytics/dashboard', adminController.getDashboardAnalytics);

/**
 * @swagger
 * /api/admin/analytics/appointments:
 *   get:
 *     summary: Get appointment statistics (Admin only)
 *     tags: [Admin]
 */
router.get('/analytics/appointments', adminController.getAppointmentStats);

/**
 * @swagger
 * /api/admin/analytics/revenue:
 *   get:
 *     summary: Get revenue statistics (Admin only)
 *     tags: [Admin]
 */
router.get('/analytics/revenue', adminController.getRevenueStats);

export default router;


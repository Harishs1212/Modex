import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { adminService } from './admin.service';
import { asyncHandler } from '../../utils/asyncHandler';

export class AdminController {
  // ========== USER MANAGEMENT ==========

  createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await adminService.createUser(req.body, req.userId!, req);
    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  });

  getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const query = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      role: req.query.role as string | undefined,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      search: req.query.search as string | undefined,
    };
    const result = await adminService.getUsers(query);
    res.json(result);
  });

  getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await adminService.getUserById(req.params.userId);
    res.json(user);
  });

  updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await adminService.updateUser(req.params.userId, req.body, req.userId!, req);
    res.json({
      message: 'User updated successfully',
      user,
    });
  });

  deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await adminService.deleteUser(req.params.userId, req.userId!, req);
    res.json(result);
  });

  resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await adminService.resetPassword(req.params.userId, req.body, req.userId!, req);
    res.json(result);
  });

  // ========== DOCTOR MANAGEMENT ==========

  getPendingDoctors = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const doctors = await adminService.getPendingDoctors();
    res.json({ doctors });
  });

  approveDoctor = asyncHandler(async (req: AuthRequest, res: Response) => {
    const doctor = await adminService.approveDoctor(req.params.doctorId, req.body, req.userId!, req);
    res.json({
      message: `Doctor ${req.body.status.toLowerCase()} successfully`,
      doctor,
    });
  });

  // ========== DEPARTMENT MANAGEMENT ==========

  createDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const department = await adminService.createDepartment(req.body, req.userId!, req);
    res.status(201).json({
      message: 'Department created successfully',
      department,
    });
  });

  getDepartments = asyncHandler(async (req: AuthRequest, res: Response) => {
    const includeInactive = req.query.includeInactive === 'true';
    const departments = await adminService.getDepartments(includeInactive);
    res.json({ departments });
  });

  updateDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const department = await adminService.updateDepartment(req.params.departmentId, req.body, req.userId!, req);
    res.json({
      message: 'Department updated successfully',
      department,
    });
  });

  deleteDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await adminService.deleteDepartment(req.params.departmentId, req.userId!, req);
    res.json(result);
  });

  // ========== TREATMENT CATEGORY MANAGEMENT ==========

  createTreatmentCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const category = await adminService.createTreatmentCategory(req.body, req.userId!, req);
    res.status(201).json({
      message: 'Treatment category created successfully',
      category,
    });
  });

  getTreatmentCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
    const includeInactive = req.query.includeInactive === 'true';
    const categories = await adminService.getTreatmentCategories(includeInactive);
    res.json({ categories });
  });

  updateTreatmentCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const category = await adminService.updateTreatmentCategory(req.params.categoryId, req.body, req.userId!, req);
    res.json({
      message: 'Treatment category updated successfully',
      category,
    });
  });

  deleteTreatmentCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await adminService.deleteTreatmentCategory(req.params.categoryId, req.userId!, req);
    res.json(result);
  });

  // ========== ANALYTICS & REPORTING ==========

  getDashboardAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const query = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      groupBy: req.query.groupBy as 'day' | 'week' | 'month' | undefined,
    };
    const analytics = await adminService.getDashboardAnalytics(query);
    res.json(analytics);
  });

  getAppointmentStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const query = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      groupBy: req.query.groupBy as 'day' | 'week' | 'month' | undefined,
    };
    const stats = await adminService.getAppointmentStats(query);
    res.json({ stats });
  });

  getRevenueStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const query = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      groupBy: req.query.groupBy as 'day' | 'week' | 'month' | undefined,
    };
    const stats = await adminService.getRevenueStats(query);
    res.json({ stats });
  });

  // ========== ATTENDANCE & RISK MANAGEMENT ==========

  markAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
    const appointment = await adminService.markAttendance(
      req.params.appointmentId,
      req.body,
      req.userId!
    );
    res.json({
      message: 'Attendance marked successfully',
      appointment,
    });
  });

  updatePatientRiskLevel = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await adminService.updatePatientRiskLevel(
      req.params.patientId,
      req.body,
      req.userId!
    );
    res.json({
      message: 'Patient risk level updated successfully',
      ...result,
    });
  });

  getSlotBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await adminService.getSlotBookings(req.params.slotId);
    res.json(result);
  });

  // ========== DOCTOR PROFILE MANAGEMENT ==========

  createDoctorProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const doctor = await adminService.createDoctorProfile(req.body, req.userId!, req);
    res.status(201).json({
      message: 'Doctor profile created successfully',
      doctor,
    });
  });

  // Get specializations list
  getSpecializations = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const { PREGNANCY_SPECIALIZATIONS } = await import('./admin.types');
    res.json({ specializations: PREGNANCY_SPECIALIZATIONS });
  });

  setDoctorSlotAvailability = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await adminService.setDoctorSlotAvailability(req.body, req.userId!, req);
    res.json(result);
  });
}

export const adminController = new AdminController();


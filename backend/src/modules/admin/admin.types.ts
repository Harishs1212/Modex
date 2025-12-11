import { z } from 'zod';

// User Management
export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN']),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
});

export const UpdateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
});

export const ResetPasswordSchema = z.object({
  newPassword: z.string().min(6),
});

// Doctor Approval
export const ApproveDoctorSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED']),
  rejectionReason: z.string().optional(),
});

// Department Management
export const CreateDepartmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const UpdateDepartmentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Treatment Category
export const CreateTreatmentCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const UpdateTreatmentCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Analytics Query
export const AnalyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type ApproveDoctorInput = z.infer<typeof ApproveDoctorSchema>;
export type CreateDepartmentInput = z.infer<typeof CreateDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof UpdateDepartmentSchema>;
export type CreateTreatmentCategoryInput = z.infer<typeof CreateTreatmentCategorySchema>;
export type UpdateTreatmentCategoryInput = z.infer<typeof UpdateTreatmentCategorySchema>;
export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;


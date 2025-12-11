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

// Attendance Tracking
export const UpdateAttendanceSchema = z.object({
  attendanceStatus: z.enum(['ATTENDED', 'NOT_ATTENDED']),
});

// Risk Level Update
export const UpdateRiskLevelSchema = z.object({
  riskLevel: z.enum(['LOW', 'HIGH']),
});

// Pregnancy-related specializations
export const PREGNANCY_SPECIALIZATIONS = [
  'Obstetrics & Gynecology',
  'Maternal-Fetal Medicine',
  'Perinatology',
  'Reproductive Endocrinology',
  'Neonatology',
  'Prenatal Care',
  'Postpartum Care',
  'High-Risk Pregnancy',
  'Fetal Medicine',
  'Reproductive Health',
  'Pregnancy Counseling',
  'Antenatal Care',
] as const;

// Create Doctor Profile (Admin)
export const CreateDoctorProfileSchema = z.object({
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
    specialization: z.string().min(1, 'Specialization is required'),
    licenseNumber: z.string().min(1, 'License number is required'),
    yearsOfExperience: z.number().int().positive().optional(),
    bio: z.string().optional(),
    departmentId: z.string().uuid().optional(),
  }),
});

// Set Doctor Slot Availability (Admin)
export const SetDoctorSlotAvailabilitySchema = z.object({
  body: z.object({
    doctorId: z.string().uuid('Invalid doctor ID'),
    slots: z.array(
      z.object({
        slotDate: z.string().refine(
          (val) => {
            // Accept ISO datetime strings or date strings that can be parsed
            const date = new Date(val);
            return !isNaN(date.getTime());
          },
          { message: 'Invalid date format' }
        ),
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:00)?$/, 'Invalid time format (HH:mm or HH:mm:ss)'),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:00)?$/, 'Invalid time format (HH:mm or HH:mm:ss)'),
        maxCapacity: z.number().int().min(1).max(20).default(6),
      })
    ).min(1, 'At least one slot is required'),
  }),
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
export type UpdateAttendanceInput = z.infer<typeof UpdateAttendanceSchema>;
export type UpdateRiskLevelInput = z.infer<typeof UpdateRiskLevelSchema>;
export type CreateDoctorProfileInput = z.infer<typeof CreateDoctorProfileSchema>['body'];
export type SetDoctorSlotAvailabilityInput = z.infer<typeof SetDoctorSlotAvailabilitySchema>['body'];


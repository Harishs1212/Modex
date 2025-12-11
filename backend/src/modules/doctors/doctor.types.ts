import { z } from 'zod';

export const createDoctorSchema = z.object({
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
    specialization: z.string().min(1, 'Specialization is required'),
    licenseNumber: z.string().min(1, 'License number is required'),
    yearsOfExperience: z.number().int().positive().optional(),
    bio: z.string().optional(),
  }),
});

export const updateAvailabilitySchema = z.object({
  body: z.object({
    availability: z.array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
      })
    ),
  }),
});

export const getDoctorsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    specialization: z.string().optional(),
    isAvailable: z.string().optional().transform((val) => val === 'true'),
  }),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>['body'];
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>['body'];
export type GetDoctorsQuery = z.infer<typeof getDoctorsQuerySchema>['query'];


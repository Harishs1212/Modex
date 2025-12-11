import { z } from 'zod';

export const createAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.string().uuid('Invalid doctor ID'),
    appointmentDate: z.string().datetime('Invalid date format'),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
    notes: z.string().optional(),
  }),
});

export const updateAppointmentSchema = z.object({
  body: z.object({
    appointmentDate: z.string().datetime().optional(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    notes: z.string().optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'MISSED']).optional(),
  }),
});

export const getAppointmentsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1').transform((val) => {
      const num = parseInt(val, 10);
      return isNaN(num) || num < 1 ? 1 : num;
    }),
    limit: z.string().optional().default('10').transform((val) => {
      const num = parseInt(val, 10);
      return isNaN(num) || num < 1 ? 10 : num;
    }),
    patientId: z.string().uuid().optional(),
    doctorId: z.string().uuid().optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'MISSED']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

export const getSlotsQuerySchema = z.object({
  query: z.object({
    doctorId: z.string().uuid('Invalid doctor ID'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  }),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>['body'];
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>['body'];
export type GetAppointmentsQuery = z.infer<typeof getAppointmentsQuerySchema>['query'];
export type GetSlotsQuery = z.infer<typeof getSlotsQuerySchema>['query'];

import { z } from 'zod';

export const createSlotSchema = z.object({
  body: z.object({
    doctorId: z.string().uuid('Invalid doctor ID'),
    slotDate: z.string().datetime('Invalid date format'),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
    maxCapacity: z.number().int().min(1).max(20).default(6),
  }),
});

export const updateSlotSchema = z.object({
  body: z.object({
    slotDate: z.string().datetime().optional(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    maxCapacity: z.number().int().min(1).max(20).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getSlotsQuerySchema = z.object({
  query: z.object({
    doctorId: z.string().uuid().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
    isActive: z.preprocess(
      (val) => {
        if (val === undefined || val === null || val === '') return undefined;
        if (typeof val === 'boolean') return val;
        if (typeof val === 'string') {
          return val === 'true' || val === '1';
        }
        return undefined;
      },
      z.boolean().optional()
    ),
    page: z.string().optional().default('1').transform((val) => {
      const num = parseInt(val, 10);
      return isNaN(num) || num < 1 ? 1 : num;
    }),
    limit: z.string().optional().default('10').transform((val) => {
      const num = parseInt(val, 10);
      return isNaN(num) || num < 1 ? 10 : num;
    }),
  }),
});

export const bookSlotSchema = z.object({
  body: z.object({
    slotId: z.string().uuid('Invalid slot ID'),
    notes: z.string().optional(),
  }),
});

export const movePatientSchema = z.object({
  body: z.object({
    appointmentId: z.string().uuid('Invalid appointment ID'),
    newSlotId: z.string().uuid('Invalid slot ID'),
  }),
});

export type CreateSlotInput = z.infer<typeof createSlotSchema>['body'];
export type UpdateSlotInput = z.infer<typeof updateSlotSchema>['body'];
export type GetSlotsQuery = z.infer<typeof getSlotsQuerySchema>['query'];
export type BookSlotInput = z.infer<typeof bookSlotSchema>['body'];
export type MovePatientInput = z.infer<typeof movePatientSchema>['body'];


import { z } from 'zod';

export const CreateMedicalRecordSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  recordType: z.enum(['CONSULTATION', 'LAB_REPORT', 'DIAGNOSIS', 'TREATMENT', 'FOLLOW_UP']),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  labResults: z.record(z.any()).optional(),
  treatmentPlan: z.string().optional(),
  followUpDate: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

export const UpdateMedicalRecordSchema = z.object({
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  labResults: z.record(z.any()).optional(),
  treatmentPlan: z.string().optional(),
  followUpDate: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

export type CreateMedicalRecordInput = z.infer<typeof CreateMedicalRecordSchema>;
export type UpdateMedicalRecordInput = z.infer<typeof UpdateMedicalRecordSchema>;


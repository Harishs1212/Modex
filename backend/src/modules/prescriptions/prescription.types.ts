import { z } from 'zod';

const MedicationSchema = z.object({
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string(),
  instructions: z.string().optional(),
});

export const CreatePrescriptionSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  medications: z.array(MedicationSchema),
  notes: z.string().optional(),
});

export const UpdatePrescriptionSchema = z.object({
  medications: z.array(MedicationSchema).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreatePrescriptionInput = z.infer<typeof CreatePrescriptionSchema>;
export type UpdatePrescriptionInput = z.infer<typeof UpdatePrescriptionSchema>;


import { z } from 'zod';

export const CreatePaymentSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  amount: z.number().positive(),
  paymentMethod: z.enum(['CASH', 'CARD', 'ONLINE', 'INSURANCE']),
  description: z.string().optional(),
});

export const UpdatePaymentSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
  transactionId: z.string().optional(),
  invoiceNumber: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof UpdatePaymentSchema>;


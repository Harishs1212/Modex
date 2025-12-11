import { z } from 'zod';

export const predictRiskSchema = z.object({
  body: z.object({
    age: z.number().min(15).max(50),
    systolic_bp: z.number().min(80).max(180),
    diastolic_bp: z.number().min(40).max(120),
    blood_sugar: z.number().min(3).max(15),
    body_temp: z.number().min(95).max(104),
    bmi: z.number().min(10).max(50),
    previous_complications: z.number().int().min(0).max(1),
    preexisting_diabetes: z.number().int().min(0).max(1),
    gestational_diabetes: z.number().int().min(0).max(1),
    mental_health: z.number().int().min(0).max(1),
    heart_rate: z.number().min(40).max(120),
  }),
});

export const getRiskHistoryQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
});

export type PredictRiskInput = z.infer<typeof predictRiskSchema>['body'];


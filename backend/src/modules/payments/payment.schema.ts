import { z } from 'zod';

export const createPaymentSchema = z.object({
  loan_id: z.string().uuid('ID prêt invalide.'),
  amount_paid: z.number().positive('Le montant doit être supérieur à 0.'),
  payment_type: z.enum(['full', 'partial', 'advance']),
  payment_date: z.string().transform((val) => new Date(val)),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

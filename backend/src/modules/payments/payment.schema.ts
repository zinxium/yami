import { z } from 'zod';

export const createPaymentSchema = z.object({
  loan_id: z.string().uuid('ID prêt invalide.'),
  amount_paid: z.number().positive('Le montant doit être supérieur à 0.').max(999999999),
  payment_type: z.enum(['full', 'partial', 'advance']),
  payment_date: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Date invalide.')
    .transform((val) => new Date(val)),
  payment_method: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

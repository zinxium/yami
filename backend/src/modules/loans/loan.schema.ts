import { z } from 'zod';

export const createLoanSchema = z.object({
  borrower_id: z.string().uuid('ID emprunteur invalide.'),
  amount: z.number().positive('Le montant doit être supérieur à 0.').max(999999999),
  interest_rate: z.number().min(0).max(100, 'Le taux doit être entre 0 et 100.'),
  duration: z.number().int().positive('La durée doit être supérieure à 0.').max(360),
  duration_unit: z.enum(['months', 'weeks']),
  start_date: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Date invalide.')
    .transform((val) => new Date(val)),
  notes: z.string().max(2000).optional(),
});

export const updateLoanSchema = z.object({
  amount: z.number().positive('Le montant doit être supérieur à 0.').max(999999999).optional(),
  interest_rate: z.number().min(0).max(100).optional(),
  duration: z.number().int().positive().max(360).optional(),
  duration_unit: z.enum(['months', 'weeks']).optional(),
  start_date: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Date invalide.')
    .transform((val) => new Date(val))
    .optional(),
  notes: z.string().max(2000).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['active', 'paid', 'overdue']),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type UpdateLoanInput = z.infer<typeof updateLoanSchema>;

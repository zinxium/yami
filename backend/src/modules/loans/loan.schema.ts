import { z } from 'zod';

export const createLoanSchema = z.object({
  borrower_id: z.string().uuid('ID emprunteur invalide.'),
  amount: z.number().positive('Le montant doit être supérieur à 0.'),
  interest_rate: z.number().min(0).max(100, 'Le taux doit être entre 0 et 100.'),
  duration: z.number().int().positive('La durée doit être supérieure à 0.'),
  duration_unit: z.enum(['months', 'weeks']),
  start_date: z.string().transform((val) => new Date(val)),
  notes: z.string().optional(),
});

export const updateLoanSchema = z.object({
  amount: z.number().positive('Le montant doit être supérieur à 0.').optional(),
  interest_rate: z.number().min(0).max(100).optional(),
  duration: z.number().int().positive().optional(),
  duration_unit: z.enum(['months', 'weeks']).optional(),
  start_date: z.string().transform((val) => new Date(val)).optional(),
  notes: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['active', 'paid', 'overdue']),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type UpdateLoanInput = z.infer<typeof updateLoanSchema>;

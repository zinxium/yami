import { z } from 'zod';

export const createBorrowerSchema = z.object({
  fullname: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const updateBorrowerSchema = z.object({
  fullname: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateBorrowerInput = z.infer<typeof createBorrowerSchema>;
export type UpdateBorrowerInput = z.infer<typeof updateBorrowerSchema>;

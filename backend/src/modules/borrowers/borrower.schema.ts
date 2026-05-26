import { z } from 'zod';

export const createBorrowerSchema = z.object({
  fullname: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.').max(100),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateBorrowerSchema = z.object({
  fullname: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.').max(100).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

export type CreateBorrowerInput = z.infer<typeof createBorrowerSchema>;
export type UpdateBorrowerInput = z.infer<typeof updateBorrowerSchema>;

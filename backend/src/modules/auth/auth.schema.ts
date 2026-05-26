import { z } from 'zod';

export const registerSchema = z.object({
  fullname: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.').max(100),
  email: z.string().email('Email invalide.').max(254),
  phone: z.string().min(8, 'Numéro de téléphone invalide.').max(20),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
    .max(128)
    .regex(/[A-Z]/, 'Doit contenir au moins une majuscule.')
    .regex(/[a-z]/, 'Doit contenir au moins une minuscule.')
    .regex(/[0-9]/, 'Doit contenir au moins un chiffre.'),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide.').max(254),
  password: z.string().min(1, 'Mot de passe requis.').max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide.').max(254),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

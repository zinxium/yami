import { Request, Response } from 'express';
import * as authService from './auth.service';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Erreur serveur.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Erreur serveur.' });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token requis.' });
      return;
    }
    const result = await authService.refresh(refreshToken);
    res.json(result);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Erreur serveur.' });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  // Côté client, supprimer le token. Côté serveur, rien à faire pour l'instant (stateless JWT).
  res.json({ message: 'Déconnexion réussie.' });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.json(result);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Erreur serveur.' });
  }
}

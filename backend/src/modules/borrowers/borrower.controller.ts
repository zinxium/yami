import { Response } from 'express';
import { AuthRequest } from '../../types';
import * as borrowerService from './borrower.service';

export async function getAll(req: AuthRequest, res: Response): Promise<void> {
  try {
    const borrowers = await borrowerService.getAll(req.user!.userId);
    res.json(borrowers);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const borrower = await borrowerService.getById(req.user!.userId, req.params.id as string);
    res.json(borrower);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    const borrower = await borrowerService.create(req.user!.userId, req.body);
    res.status(201).json(borrower);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const borrower = await borrowerService.update(req.user!.userId, req.params.id as string, req.body);
    res.json(borrower);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try {
    await borrowerService.remove(req.user!.userId, req.params.id as string);
    res.json({ message: 'Emprunteur supprimé.' });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

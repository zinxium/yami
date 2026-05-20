import { Response } from 'express';
import { AuthRequest } from '../../types';
import * as loanService from './loan.service';

export async function getAll(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status, search } = req.query;
    const loans = await loanService.getAll(req.user!.userId, {
      status: status as string,
      search: search as string,
    });
    res.json(loans);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const loan = await loanService.getById(req.user!.userId, req.params.id as string);
    res.json(loan);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    const loan = await loanService.create(req.user!.userId, req.body);
    res.status(201).json(loan);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const loan = await loanService.update(req.user!.userId, req.params.id as string, req.body);
    res.json(loan);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try {
    await loanService.remove(req.user!.userId, req.params.id as string);
    res.json({ message: 'Prêt supprimé.' });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

export async function markAsPaid(req: AuthRequest, res: Response): Promise<void> {
  try {
    const loan = await loanService.markAsPaid(req.user!.userId, req.params.id as string);
    res.json(loan);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

export async function getSchedule(req: AuthRequest, res: Response): Promise<void> {
  try {
    const loan = await loanService.getById(req.user!.userId, req.params.id as string);
    const schedule = loanService.getSchedule(loan);
    res.json(schedule);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

export async function getTicket(req: AuthRequest, res: Response): Promise<void> {
  try {
    const loan = await loanService.getById(req.user!.userId, req.params.id as string);
    const ticket = loanService.generateTicket(loan);
    res.json({ ticket });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

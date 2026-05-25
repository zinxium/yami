import { Response } from 'express';
import { AuthRequest } from '../../types';
import * as loanService from './loan.service';
import { getErrorStatus, getErrorMessage } from '../../utils/error';

export async function getAll(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status, search } = req.query;
    const loans = await loanService.getAll(req.user!.userId, {
      status: status as string,
      search: search as string,
    });
    res.json(loans);
  } catch (error: unknown) {
    res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
  }
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const loan = await loanService.getById(req.user!.userId, req.params.id as string);
    res.json(loan);
  } catch (error: unknown) {
    res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
  }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    const loan = await loanService.create(req.user!.userId, req.body);
    res.status(201).json(loan);
  } catch (error: unknown) {
    res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const loan = await loanService.update(req.user!.userId, req.params.id as string, req.body);
    res.json(loan);
  } catch (error: unknown) {
    res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
  }
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try {
    await loanService.remove(req.user!.userId, req.params.id as string);
    res.json({ message: 'Prêt supprimé.' });
  } catch (error: unknown) {
    res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
  }
}

export async function markAsPaid(req: AuthRequest, res: Response): Promise<void> {
  try {
    const loan = await loanService.markAsPaid(req.user!.userId, req.params.id as string);
    res.json(loan);
  } catch (error: unknown) {
    res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
  }
}

export async function getSchedule(req: AuthRequest, res: Response): Promise<void> {
  try {
    const loan = await loanService.getById(req.user!.userId, req.params.id as string);
    const schedule = loanService.getSchedule(loan);
    res.json(schedule);
  } catch (error: unknown) {
    res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
  }
}

export async function getTicket(req: AuthRequest, res: Response): Promise<void> {
  try {
    const loan = await loanService.getById(req.user!.userId, req.params.id as string);
    const ticket = loanService.generateTicket(loan);
    res.json({ ticket });
  } catch (error: unknown) {
    res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
  }
}

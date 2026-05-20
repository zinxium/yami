import { Response } from 'express';
import { AuthRequest } from '../../types';
import * as paymentService from './payment.service';

export async function getByLoan(req: AuthRequest, res: Response): Promise<void> {
  try {
    const payments = await paymentService.getByLoan(req.user!.userId, req.params.loanId as string);
    res.json(payments);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    const payment = await paymentService.create(req.user!.userId, req.body);
    res.status(201).json(payment);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await paymentService.remove(req.user!.userId, req.params.id as string);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

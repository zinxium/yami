import { Response } from 'express';
import { AuthRequest } from '../../types';
import * as contractService from './contract.service';
import { getErrorStatus, getErrorMessage } from '../../utils/error';

export async function generate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { loan_id } = req.body;
    if (!loan_id) {
      res.status(400).json({ error: 'loan_id requis.' });
      return;
    }
    const contract = await contractService.generate(req.user!.userId, loan_id);
    res.status(201).json(contract);
  } catch (error: unknown) {
    res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
  }
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const contract = await contractService.getById(req.user!.userId, req.params.id as string);
    res.json(contract);
  } catch (error: unknown) {
    res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
  }
}

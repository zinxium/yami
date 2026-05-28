import { Request, Response } from 'express';
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

export async function getByLoanId(req: AuthRequest, res: Response): Promise<void> {
  try {
    const contract = await contractService.getByLoanId(req.user!.userId, req.params.loanId as string);
    res.json(contract);
  } catch (error: unknown) {
    res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
  }
}

export async function sign(req: AuthRequest, res: Response): Promise<void> {
  try {
    const contract = await contractService.sign(req.user!.userId, req.params.id as string);
    res.json(contract);
  } catch (error: unknown) {
    res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
  }
}

export async function verify(req: Request, res: Response): Promise<void> {
  try {
    const contractNumber = req.params.contractNumber as string;
    const result = await contractService.verify(contractNumber);
    res.json(result);
  } catch (error: unknown) {
    res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
  }
}

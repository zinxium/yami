import { Response } from 'express';
import { AuthRequest } from '../../types';
import * as reportService from './report.service';

export async function getExcel(req: AuthRequest, res: Response): Promise<void> {
  try {
    const buffer = await reportService.generateExcel(req.user!.userId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=ya-mi-releve.xlsx');
    res.send(buffer);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

export async function getCSV(req: AuthRequest, res: Response): Promise<void> {
  try {
    const csv = await reportService.generateCSV(req.user!.userId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=ya-mi-releve.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

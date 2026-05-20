import { Response } from 'express';
import { AuthRequest } from '../../types';
import * as notificationService from './notification.service';
import { prisma } from '../../config/prisma';

export async function getAll(req: AuthRequest, res: Response): Promise<void> {
  try {
    const notifications = await notificationService.getAll(req.user!.userId);
    res.json(notifications);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

export async function markAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const notification = await notificationService.markAsRead(req.user!.userId, req.params.id as string);
    res.json(notification);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

export async function updateFcmToken(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { fcm_token } = req.body;
    if (!fcm_token) {
      res.status(400).json({ error: 'fcm_token requis.' });
      return;
    }
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { fcm_token },
    });
    res.json({ message: 'Token FCM mis à jour.' });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message || 'Erreur serveur.' });
  }
}

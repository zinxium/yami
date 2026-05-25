import { Response } from 'express';
import { AuthRequest } from '../../types';
import * as notificationService from './notification.service';
import { prisma } from '../../config/prisma';
import { getErrorStatus, getErrorMessage } from '../../utils/error';

export async function getAll(req: AuthRequest, res: Response): Promise<void> {
  try {
    const notifications = await notificationService.getAll(req.user!.userId);
    res.json(notifications);
  } catch (error: unknown) {
    res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
  }
}

export async function markAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const notification = await notificationService.markAsRead(req.user!.userId, req.params.id as string);
    res.json(notification);
  } catch (error: unknown) {
    res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
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
  } catch (error: unknown) {
    res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
  }
}

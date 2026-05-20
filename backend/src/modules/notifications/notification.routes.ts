import { Router } from 'express';
import * as notificationController from './notification.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware as any);

router.get('/', notificationController.getAll as any);
router.put('/:id/read', notificationController.markAsRead as any);
router.put('/fcm-token', notificationController.updateFcmToken as any);

export default router;

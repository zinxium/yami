import { Router } from 'express';
import * as contractController from './contract.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware as any);

router.post('/generate', contractController.generate as any);
router.get('/:id', contractController.getById as any);

export default router;

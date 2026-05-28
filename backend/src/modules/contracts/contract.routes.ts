import { Router } from 'express';
import * as contractController from './contract.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// Public route — verification via QR code scan (no auth required)
router.get('/verify/:contractNumber', contractController.verify as any);

router.use(authMiddleware as any);

router.post('/generate', contractController.generate as any);
router.get('/loan/:loanId', contractController.getByLoanId as any);
router.put('/:id/sign', contractController.sign as any);
router.get('/:id', contractController.getById as any);

export default router;

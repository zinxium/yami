import { Router } from 'express';
import * as paymentController from './payment.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createPaymentSchema } from './payment.schema';

const router = Router();

router.use(authMiddleware as any);

router.get('/:loanId', paymentController.getByLoan as any);
router.post('/', validate(createPaymentSchema), paymentController.create as any);
router.delete('/:id', paymentController.remove as any);

export default router;

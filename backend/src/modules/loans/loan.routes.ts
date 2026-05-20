import { Router } from 'express';
import * as loanController from './loan.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createLoanSchema, updateLoanSchema } from './loan.schema';

const router = Router();

router.use(authMiddleware as any);

router.get('/', loanController.getAll as any);
router.get('/:id', loanController.getById as any);
router.get('/:id/schedule', loanController.getSchedule as any);
router.get('/:id/ticket', loanController.getTicket as any);
router.post('/', validate(createLoanSchema), loanController.create as any);
router.put('/:id', validate(updateLoanSchema), loanController.update as any);
router.put('/:id/paid', loanController.markAsPaid as any);
router.delete('/:id', loanController.remove as any);

export default router;

import { Router } from 'express';
import * as borrowerController from './borrower.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createBorrowerSchema, updateBorrowerSchema } from './borrower.schema';

const router = Router();

router.use(authMiddleware as any);

router.get('/', borrowerController.getAll as any);
router.get('/:id', borrowerController.getById as any);
router.post('/', validate(createBorrowerSchema), borrowerController.create as any);
router.put('/:id', validate(updateBorrowerSchema), borrowerController.update as any);
router.delete('/:id', borrowerController.remove as any);

export default router;

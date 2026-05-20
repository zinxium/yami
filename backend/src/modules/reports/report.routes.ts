import { Router } from 'express';
import * as reportController from './report.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware as any);

router.get('/excel', reportController.getExcel as any);
router.get('/csv', reportController.getCSV as any);

export default router;

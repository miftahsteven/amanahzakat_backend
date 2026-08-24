import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';
import { PayrollController } from './payroll.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/', checkPermission('payroll.read'), PayrollController.list);
router.post('/process', checkPermission('payroll.update'), PayrollController.process);
router.post('/', checkPermission('payroll.update'), PayrollController.create);
router.patch('/:id', checkPermission('payroll.update'), PayrollController.update);

export default router;

import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';
import { PenyaluranController } from './penyaluran.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/', checkPermission('penyaluran.read'), PenyaluranController.list);
router.get('/mustahik', checkPermission('penyaluran.read'), PenyaluranController.listMustahik);
router.get('/program', checkPermission('penyaluran.read'), PenyaluranController.listProgram);
router.get('/:id', checkPermission('penyaluran.read'), PenyaluranController.getById);
router.post('/', checkPermission('penyaluran.create'), PenyaluranController.create);
router.patch('/:id/disburse', checkPermission('penyaluran.verify'), PenyaluranController.disburse);

export default router;

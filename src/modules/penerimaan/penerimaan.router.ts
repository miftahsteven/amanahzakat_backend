import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';
import { PenerimaanController } from './penerimaan.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/', checkPermission('penerimaan.read'), PenerimaanController.list);
router.get('/muzakki', checkPermission('penerimaan.read'), PenerimaanController.listMuzakki);
router.post('/', checkPermission('penerimaan.create'), PenerimaanController.create);
router.patch('/:id/verify', checkPermission('penerimaan.verify'), PenerimaanController.verify);

export default router;

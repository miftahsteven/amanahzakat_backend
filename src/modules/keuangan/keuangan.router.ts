import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';
import { KeuanganController } from './keuangan.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/coa', checkPermission('jurnal.read'), KeuanganController.listCoa);
router.get('/jurnal', checkPermission('jurnal.read'), KeuanganController.listJurnal);
router.post('/jurnal', checkPermission('jurnal.create'), KeuanganController.createJurnal);
router.get('/simba', checkPermission('simba.read'), KeuanganController.listSimba);
router.patch('/simba/:kodeForm/export', checkPermission('simba.export'), KeuanganController.exportSimba);
router.get('/closing', checkPermission('closing.read'), KeuanganController.getClosing);
router.patch('/closing/step', checkPermission('closing.execute'), KeuanganController.updateClosingStep);
router.patch('/closing/lock', checkPermission('closing.execute'), KeuanganController.toggleClosingLock);

export default router;

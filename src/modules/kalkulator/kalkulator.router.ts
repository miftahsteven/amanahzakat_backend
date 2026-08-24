import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { KalkulatorController } from './kalkulator.controller';
import { hitungZakatSchema, listRiwayatSchema, updateZakatConfigSchema } from './kalkulator.schema';

const router = Router();

router.use(authenticateJWT);

router.get('/config', checkPermission('kalkulator.read'), KalkulatorController.getConfig);
router.put('/config', checkPermission('kalkulator.update'), validateRequest(updateZakatConfigSchema), KalkulatorController.updateConfig);
router.post('/hitung', checkPermission('kalkulator.read'), validateRequest(hitungZakatSchema), KalkulatorController.hitung);
router.get('/riwayat', checkPermission('kalkulator.read'), validateRequest(listRiwayatSchema), KalkulatorController.listRiwayat);

export default router;

import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';
import { LaporanController } from './laporan.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/distribusi', checkPermission('laporan.read'), LaporanController.distribusi);
router.get('/sebaran', checkPermission('peta.read'), LaporanController.sebaran);
router.get('/dampak', checkPermission('dampak.read'), LaporanController.dampak);

export default router;

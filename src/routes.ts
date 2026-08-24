import { Router } from 'express';
import authRouter from './modules/auth/auth.router';
import userRouter from './modules/users/user.router';
import aclRouter from './modules/acl/acl.router';
import publicRouter from './modules/public/public.router';
import cmsRouter from './modules/cms/cms.router';
import penerimaanRouter from './modules/penerimaan/penerimaan.router';
import muzakkiRouter from './modules/muzakki/muzakki.router';
import penyaluranRouter from './modules/penyaluran/penyaluran.router';
import mustahikRouter from './modules/mustahik/mustahik.router';
import programRouter from './modules/program/program.router';
import mitraRouter from './modules/mitra/mitra.router';
import upzRouter from './modules/upz/upz.router';
import payrollRouter from './modules/payroll/payroll.router';

const router = Router();

// API Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'Amanah Zakat ERP Backend Service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Route Modules
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/acl', aclRouter);
router.use('/public', publicRouter);
router.use('/cms', cmsRouter);
router.use('/penerimaan', penerimaanRouter);
router.use('/muzakki', muzakkiRouter);
router.use('/penyaluran', penyaluranRouter);
router.use('/mustahik', mustahikRouter);
router.use('/program', programRouter);
router.use('/mitra', mitraRouter);
router.use('/upz', upzRouter);
router.use('/payroll', payrollRouter);

export default router;

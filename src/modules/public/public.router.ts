import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getCampaigns,
  getFeaturedCampaigns,
  getCampaignBySlug,
  getDistributions,
  getDistributionStats,
  getDistributionBySlug,
  getImpactSummary,
  getFaqs,
  askFaqAssistant,
  createDonationPayment,
  getPaymentStatus,
  updatePaymentStatus,
  getReceiptData,
  verifyDocument,
  submitAssistance,
  checkAssistanceStatus,
  authLogin,
  sendRegisterOtp,
  verifyRegisterOtp,
  resendRegisterOtp,
  muzakkiLogin,
  muzakkiRegister,
  updateMuzakkiProfile,
  getMuzakkiSbmzList,
  getMuzakkiRecurringPlans,
  createMuzakkiRecurringPlan,
  toggleRecurringPlanStatus,
  deleteRecurringPlan,
  getPublicHeroSliders,
  getPublicTestimonials,
  getPublicWebSettings,
  mustahikLogin,
  mustahikRegister,
  getMustahikProfile,
  updateMustahikProfile,
  uploadMustahikDoc,
  getMustahikSubmissions,
  createMustahikSubmission,
} from './public.controller';
import { getPublicZakatConfig, postPublicZakatHitung } from '../kalkulator/kalkulator.controller';
import { hitungZakatSchema } from '../kalkulator/kalkulator.schema';
import { validateRequest } from '../../middlewares/validate.middleware';

const router = Router();

// Multer Storage Configuration for Mustahik Documents (Max 50MB)
const docUploadDir = path.join(process.cwd(), 'uploads', 'documents');
if (!fs.existsSync(docUploadDir)) {
  fs.mkdirSync(docUploadDir, { recursive: true });
}

const docStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, docUploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

const uploadDoc = multer({
  storage: docStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf|doc|docx/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype) || file.mimetype === 'application/pdf';
    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Hanya format file gambar (JPG, PNG, WEBP) atau PDF/DOC yang diperbolehkan!'));
  },
});

// 1. Campaigns & Programs
router.get('/campaigns', getCampaigns);
router.get('/campaigns/featured', getFeaturedCampaigns);
router.get('/campaigns/:slug', getCampaignBySlug);

// 2. Hero Sliders, Testimonials & Settings
router.get('/hero-sliders', getPublicHeroSliders);
router.get('/testimonials', getPublicTestimonials);
router.get('/settings', getPublicWebSettings);

// Zakat Calculator (public)
router.get('/zakat/config', getPublicZakatConfig);
router.post('/zakat/hitung', validateRequest(hitungZakatSchema), postPublicZakatHitung);

// 3. Distributions & Impact
router.get('/distributions', getDistributions);
router.get('/distributions/stats', getDistributionStats);
router.get('/distributions/:slug', getDistributionBySlug);
router.get('/impact/summary', getImpactSummary);

// 4. FAQs & AI Assistant
router.get('/faqs', getFaqs);
router.post('/faqs/ask', askFaqAssistant);

// 5. Donations & ERP Integration
router.post('/donations/payments', createDonationPayment);
router.get('/donations/:transactionId', getPaymentStatus);
router.post('/donations/:transactionId/pay', updatePaymentStatus);
router.get('/donations/:transactionId/receipt', getReceiptData);

// 6. Verification
router.get('/verification', verifyDocument);
router.get('/verification/:code(*)', verifyDocument);

// 7. Assistance Mustahik (Public Quick Submit & Tracking)
router.post('/assistance/submit', submitAssistance);
router.get('/assistance/check/:nikOrCode', checkAssistanceStatus);

// 8. Auth & Login (Unified) & OTP Registration
router.post('/auth/login', authLogin);
router.post('/auth/send-register-otp', sendRegisterOtp);
router.post('/auth/verify-register-otp', verifyRegisterOtp);
router.post('/auth/resend-register-otp', resendRegisterOtp);

// 9. Muzakki Portal
router.post('/muzakki/login', muzakkiLogin);
router.post('/muzakki/register', muzakkiRegister);
router.put('/muzakki/profile', updateMuzakkiProfile);
router.get('/muzakki/sbmz', getMuzakkiSbmzList);
router.get('/muzakki/recurring', getMuzakkiRecurringPlans);
router.post('/muzakki/recurring', createMuzakkiRecurringPlan);
router.put('/muzakki/recurring/:id/status', toggleRecurringPlanStatus);
router.delete('/muzakki/recurring/:id', deleteRecurringPlan);

// 9. Mustahik Portal
router.post('/mustahik/login', mustahikLogin);
router.post('/mustahik/register', mustahikRegister);
router.get('/mustahik/profile', getMustahikProfile);
router.put('/mustahik/profile', updateMustahikProfile);
router.post('/mustahik/upload-doc', uploadDoc.single('file'), uploadMustahikDoc);
router.get('/mustahik/submissions', getMustahikSubmissions);
router.post('/mustahik/submissions', createMustahikSubmission);

export default router;

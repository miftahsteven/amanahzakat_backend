"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const public_controller_1 = require("./public.controller");
const router = (0, express_1.Router)();
// Multer Storage Configuration for Mustahik Documents (Max 50MB)
const docUploadDir = path_1.default.join(process.cwd(), 'uploads', 'documents');
if (!fs_1.default.existsSync(docUploadDir)) {
    fs_1.default.mkdirSync(docUploadDir, { recursive: true });
}
const docStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, docUploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `doc-${uniqueSuffix}${ext}`);
    },
});
const uploadDoc = (0, multer_1.default)({
    storage: docStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    fileFilter: (_req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|pdf|doc|docx/;
        const extname = allowed.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowed.test(file.mimetype) || file.mimetype === 'application/pdf';
        if (extname || mimetype) {
            return cb(null, true);
        }
        cb(new Error('Hanya format file gambar (JPG, PNG, WEBP) atau PDF/DOC yang diperbolehkan!'));
    },
});
// 1. Campaigns & Programs
router.get('/campaigns', public_controller_1.getCampaigns);
router.get('/campaigns/featured', public_controller_1.getFeaturedCampaigns);
router.get('/campaigns/:slug', public_controller_1.getCampaignBySlug);
// 2. Hero Sliders, Testimonials & Settings
router.get('/hero-sliders', public_controller_1.getPublicHeroSliders);
router.get('/testimonials', public_controller_1.getPublicTestimonials);
router.get('/settings', public_controller_1.getPublicWebSettings);
// 3. Distributions & Impact
router.get('/distributions', public_controller_1.getDistributions);
router.get('/distributions/:slug', public_controller_1.getDistributionBySlug);
router.get('/impact/summary', public_controller_1.getImpactSummary);
// 4. FAQs & AI Assistant
router.get('/faqs', public_controller_1.getFaqs);
router.post('/faqs/ask', public_controller_1.askFaqAssistant);
// 5. Donations & ERP Integration
router.post('/donations/payments', public_controller_1.createDonationPayment);
router.get('/donations/:transactionId', public_controller_1.getPaymentStatus);
router.post('/donations/:transactionId/pay', public_controller_1.updatePaymentStatus);
router.get('/donations/:transactionId/receipt', public_controller_1.getReceiptData);
// 6. Verification
router.get('/verification', public_controller_1.verifyDocument);
router.get('/verification/:code(*)', public_controller_1.verifyDocument);
// 7. Assistance Mustahik (Public Quick Submit & Tracking)
router.post('/assistance/submit', public_controller_1.submitAssistance);
router.get('/assistance/check/:nikOrCode', public_controller_1.checkAssistanceStatus);
// 8. Muzakki Portal
router.post('/muzakki/login', public_controller_1.muzakkiLogin);
router.post('/muzakki/register', public_controller_1.muzakkiRegister);
router.put('/muzakki/profile', public_controller_1.updateMuzakkiProfile);
router.get('/muzakki/sbmz', public_controller_1.getMuzakkiSbmzList);
router.get('/muzakki/recurring', public_controller_1.getMuzakkiRecurringPlans);
router.post('/muzakki/recurring', public_controller_1.createMuzakkiRecurringPlan);
router.put('/muzakki/recurring/:id/status', public_controller_1.toggleRecurringPlanStatus);
router.delete('/muzakki/recurring/:id', public_controller_1.deleteRecurringPlan);
// 9. Mustahik Portal
router.post('/mustahik/login', public_controller_1.mustahikLogin);
router.post('/mustahik/register', public_controller_1.mustahikRegister);
router.get('/mustahik/profile', public_controller_1.getMustahikProfile);
router.put('/mustahik/profile', public_controller_1.updateMustahikProfile);
router.post('/mustahik/upload-doc', uploadDoc.single('file'), public_controller_1.uploadMustahikDoc);
router.get('/mustahik/submissions', public_controller_1.getMustahikSubmissions);
router.post('/mustahik/submissions', public_controller_1.createMustahikSubmission);
exports.default = router;

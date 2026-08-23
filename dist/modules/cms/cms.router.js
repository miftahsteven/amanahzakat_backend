"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cms_controller_1 = require("./cms.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Ensure uploads/slider directory exists
const sliderUploadDir = path_1.default.join(process.cwd(), 'uploads/slider');
if (!fs_1.default.existsSync(sliderUploadDir)) {
    fs_1.default.mkdirSync(sliderUploadDir, { recursive: true });
}
// Multer Storage Configuration (Max 50MB)
const sliderStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, sliderUploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const cleanName = path_1.default.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        cb(null, `slider-${Date.now()}-${cleanName}${ext}`);
    },
});
const uploadSlider = (0, multer_1.default)({
    storage: sliderStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Max 50 MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|gif|svg/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Hanya file gambar (JPG, PNG, WEBP, GIF, SVG) yang diperbolehkan!'));
    },
});
// Ensure uploads/campaigns directory exists
const campaignUploadDir = path_1.default.join(process.cwd(), 'uploads/campaigns');
if (!fs_1.default.existsSync(campaignUploadDir)) {
    fs_1.default.mkdirSync(campaignUploadDir, { recursive: true });
}
// Multer Storage Configuration for Campaigns (Max 50MB)
const campaignStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, campaignUploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const cleanName = path_1.default.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        cb(null, `campaign-${Date.now()}-${cleanName}${ext}`);
    },
});
const uploadCampaign = (0, multer_1.default)({
    storage: campaignStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Max 50 MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|gif|svg/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Hanya file gambar (JPG, PNG, WEBP, GIF, SVG) yang diperbolehkan!'));
    },
});
// Protect all CMS endpoints with JWT
router.use(auth_middleware_1.authenticateJWT);
// 1. Hero Sliders & Upload
router.post('/upload-slider', uploadSlider.single('file'), cms_controller_1.CmsController.uploadSliderImage);
router.get('/hero-sliders', cms_controller_1.CmsController.getHeroSliders);
router.post('/hero-sliders', cms_controller_1.CmsController.createHeroSlider);
router.put('/hero-sliders/:id', cms_controller_1.CmsController.updateHeroSlider);
router.delete('/hero-sliders/:id', cms_controller_1.CmsController.deleteHeroSlider);
// 2. Campaigns CMS & Upload
router.post('/upload-campaign', uploadCampaign.single('file'), cms_controller_1.CmsController.uploadCampaignImage);
router.get('/campaigns', cms_controller_1.CmsController.getCampaigns);
router.post('/campaigns', cms_controller_1.CmsController.createCampaign);
router.put('/campaigns/:id', cms_controller_1.CmsController.updateCampaign);
router.delete('/campaigns/:id', cms_controller_1.CmsController.deleteCampaign);
// 3. Distributions CMS
router.get('/distributions', cms_controller_1.CmsController.getDistributions);
router.post('/distributions', cms_controller_1.CmsController.createDistribution);
router.put('/distributions/:id', cms_controller_1.CmsController.updateDistribution);
router.delete('/distributions/:id', cms_controller_1.CmsController.deleteDistribution);
// 4. Testimonials CMS
router.get('/testimonials', cms_controller_1.CmsController.getTestimonials);
router.post('/testimonials', cms_controller_1.CmsController.createTestimonial);
router.put('/testimonials/:id', cms_controller_1.CmsController.updateTestimonial);
router.delete('/testimonials/:id', cms_controller_1.CmsController.deleteTestimonial);
// 5. FAQs CMS
router.get('/faqs', cms_controller_1.CmsController.getFaqs);
router.post('/faqs', cms_controller_1.CmsController.createFaq);
router.put('/faqs/:id', cms_controller_1.CmsController.updateFaq);
router.delete('/faqs/:id', cms_controller_1.CmsController.deleteFaq);
// 6. Impact Data CMS
router.get('/impact', cms_controller_1.CmsController.getImpact);
router.put('/impact', cms_controller_1.CmsController.updateImpact);
// 7. Assistance Submissions CMS
router.get('/assistance', cms_controller_1.CmsController.getAssistanceSubmissions);
router.put('/assistance/:id/status', cms_controller_1.CmsController.updateAssistanceStatus);
// 8. Web Settings CMS
router.get('/settings', cms_controller_1.CmsController.getWebSettings);
router.put('/settings', cms_controller_1.CmsController.updateWebSettings);
exports.default = router;

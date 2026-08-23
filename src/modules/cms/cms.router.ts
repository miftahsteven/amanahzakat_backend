import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CmsController } from './cms.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';

const router = Router();

// Ensure uploads/slider directory exists
const sliderUploadDir = path.join(process.cwd(), 'uploads/slider');
if (!fs.existsSync(sliderUploadDir)) {
  fs.mkdirSync(sliderUploadDir, { recursive: true });
}

// Multer Storage Configuration (Max 50MB)
const sliderStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, sliderUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `slider-${Date.now()}-${cleanName}${ext}`);
  },
});

const uploadSlider = multer({
  storage: sliderStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Max 50 MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Hanya file gambar (JPG, PNG, WEBP, GIF, SVG) yang diperbolehkan!'));
  },
});

// Ensure uploads/campaigns directory exists
const campaignUploadDir = path.join(process.cwd(), 'uploads/campaigns');
if (!fs.existsSync(campaignUploadDir)) {
  fs.mkdirSync(campaignUploadDir, { recursive: true });
}

// Multer Storage Configuration for Campaigns (Max 50MB)
const campaignStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, campaignUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `campaign-${Date.now()}-${cleanName}${ext}`);
  },
});

const uploadCampaign = multer({
  storage: campaignStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Max 50 MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Hanya file gambar (JPG, PNG, WEBP, GIF, SVG) yang diperbolehkan!'));
  },
});

// Protect all CMS endpoints with JWT
router.use(authenticateJWT);

// 1. Hero Sliders & Upload
router.post('/upload-slider', uploadSlider.single('file'), CmsController.uploadSliderImage);
router.get('/hero-sliders', CmsController.getHeroSliders);
router.post('/hero-sliders', CmsController.createHeroSlider);
router.put('/hero-sliders/:id', CmsController.updateHeroSlider);
router.delete('/hero-sliders/:id', CmsController.deleteHeroSlider);

// 2. Campaigns CMS & Upload
router.post('/upload-campaign', uploadCampaign.single('file'), CmsController.uploadCampaignImage);
router.get('/campaigns', CmsController.getCampaigns);
router.post('/campaigns', CmsController.createCampaign);
router.put('/campaigns/:id', CmsController.updateCampaign);
router.delete('/campaigns/:id', CmsController.deleteCampaign);


// 3. Distributions CMS
router.get('/distributions', CmsController.getDistributions);
router.post('/distributions', CmsController.createDistribution);
router.put('/distributions/:id', CmsController.updateDistribution);
router.delete('/distributions/:id', CmsController.deleteDistribution);

// 4. Testimonials CMS
router.get('/testimonials', CmsController.getTestimonials);
router.post('/testimonials', CmsController.createTestimonial);
router.put('/testimonials/:id', CmsController.updateTestimonial);
router.delete('/testimonials/:id', CmsController.deleteTestimonial);

// 5. FAQs CMS
router.get('/faqs', CmsController.getFaqs);
router.post('/faqs', CmsController.createFaq);
router.put('/faqs/:id', CmsController.updateFaq);
router.delete('/faqs/:id', CmsController.deleteFaq);

// 6. Impact Data CMS
router.get('/impact', CmsController.getImpact);
router.put('/impact', CmsController.updateImpact);

// 7. Assistance Submissions CMS
router.get('/assistance', CmsController.getAssistanceSubmissions);
router.put('/assistance/:id/status', CmsController.updateAssistanceStatus);

// 8. Web Settings CMS
router.get('/settings', CmsController.getWebSettings);
router.put('/settings', CmsController.updateWebSettings);

export default router;

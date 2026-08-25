import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CmsController } from './cms.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { checkPermission } from '../../middlewares/acl.middleware';

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

// Generic CMS media (testimonials, distributions, dll.)
const cmsMediaUploadDir = path.join(process.cwd(), 'uploads/cms');
if (!fs.existsSync(cmsMediaUploadDir)) {
  fs.mkdirSync(cmsMediaUploadDir, { recursive: true });
}

const cmsMediaStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, cmsMediaUploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `cms-${Date.now()}-${cleanName}${ext}`);
  },
});

const uploadCmsMedia = multer({
  storage: cmsMediaStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
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

const CMS_MEDIA_UPLOAD_PERMS = [
  'cms-hero.create',
  'cms-hero.update',
  'cms-campaigns.create',
  'cms-campaigns.update',
  'cms-testimonials.create',
  'cms-testimonials.update',
  'cms-distributions.create',
  'cms-distributions.update',
  'cms-impact.create',
  'cms-impact.update',
  'cms-assistance.create',
  'cms-assistance.update',
  'cms-faq.create',
  'cms-faq.update',
  'cms-settings.update',
];

// Protect all CMS endpoints with JWT
router.use(authenticateJWT);

router.post(
  '/upload-media',
  checkPermission(CMS_MEDIA_UPLOAD_PERMS),
  uploadCmsMedia.single('file'),
  CmsController.uploadCmsMediaImage,
);

// 1. Hero Sliders & Upload
router.post(
  '/upload-slider',
  checkPermission(['cms-hero.create', 'cms-hero.update']),
  uploadSlider.single('file'),
  CmsController.uploadSliderImage,
);
router.get('/hero-sliders', checkPermission('cms-hero.read'), CmsController.getHeroSliders);
router.post('/hero-sliders', checkPermission('cms-hero.create'), CmsController.createHeroSlider);
router.put('/hero-sliders/:id', checkPermission('cms-hero.update'), CmsController.updateHeroSlider);
router.delete('/hero-sliders/:id', checkPermission('cms-hero.delete'), CmsController.deleteHeroSlider);

// 2. Campaigns CMS & Upload
router.post(
  '/upload-campaign',
  checkPermission(['cms-campaigns.create', 'cms-campaigns.update']),
  uploadCampaign.single('file'),
  CmsController.uploadCampaignImage,
);
router.get('/campaigns', checkPermission('cms-campaigns.read'), CmsController.getCampaigns);
router.post('/campaigns', checkPermission('cms-campaigns.create'), CmsController.createCampaign);
router.put('/campaigns/:id', checkPermission('cms-campaigns.update'), CmsController.updateCampaign);
router.delete('/campaigns/:id', checkPermission('cms-campaigns.delete'), CmsController.deleteCampaign);


// 3. Distributions CMS
router.get('/distributions', checkPermission('cms-distributions.read'), CmsController.getDistributions);
router.post('/distributions', checkPermission('cms-distributions.create'), CmsController.createDistribution);
router.put('/distributions/:id', checkPermission('cms-distributions.update'), CmsController.updateDistribution);
router.delete('/distributions/:id', checkPermission('cms-distributions.delete'), CmsController.deleteDistribution);

// 4. Testimonials CMS
router.get('/testimonials', checkPermission('cms-testimonials.read'), CmsController.getTestimonials);
router.post('/testimonials', checkPermission('cms-testimonials.create'), CmsController.createTestimonial);
router.put('/testimonials/:id', checkPermission('cms-testimonials.update'), CmsController.updateTestimonial);
router.delete('/testimonials/:id', checkPermission('cms-testimonials.delete'), CmsController.deleteTestimonial);

// 5. FAQs CMS
router.get('/faqs', checkPermission('cms-faqs.read'), CmsController.getFaqs);
router.post('/faqs', checkPermission('cms-faqs.create'), CmsController.createFaq);
router.put('/faqs/:id', checkPermission('cms-faqs.update'), CmsController.updateFaq);
router.delete('/faqs/:id', checkPermission('cms-faqs.delete'), CmsController.deleteFaq);

// 6. Impact Data CMS
router.get('/impact', checkPermission('cms-impact.read'), CmsController.getImpact);
router.put('/impact', checkPermission('cms-impact.update'), CmsController.updateImpact);

// 7. Assistance Submissions CMS
router.get('/assistance', checkPermission('cms-assistance.read'), CmsController.getAssistanceSubmissions);
router.put('/assistance/:id/status', checkPermission('cms-assistance.verify'), CmsController.updateAssistanceStatus);

// 8. Web Settings CMS
router.get('/settings', checkPermission('cms-settings.read'), CmsController.getWebSettings);
router.put('/settings', checkPermission('cms-settings.update'), CmsController.updateWebSettings);

export default router;

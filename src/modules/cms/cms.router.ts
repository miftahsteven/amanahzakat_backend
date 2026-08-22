import { Router } from 'express';
import { CmsController } from './cms.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';

const router = Router();

// Protect all CMS endpoints with JWT
router.use(authenticateJWT);

// 1. Hero Sliders
router.get('/hero-sliders', CmsController.getHeroSliders);
router.post('/hero-sliders', CmsController.createHeroSlider);
router.put('/hero-sliders/:id', CmsController.updateHeroSlider);
router.delete('/hero-sliders/:id', CmsController.deleteHeroSlider);

// 2. Campaigns CMS
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

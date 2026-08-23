"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cms_controller_1 = require("./cms.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Protect all CMS endpoints with JWT
router.use(auth_middleware_1.authenticateJWT);
// 1. Hero Sliders
router.get('/hero-sliders', cms_controller_1.CmsController.getHeroSliders);
router.post('/hero-sliders', cms_controller_1.CmsController.createHeroSlider);
router.put('/hero-sliders/:id', cms_controller_1.CmsController.updateHeroSlider);
router.delete('/hero-sliders/:id', cms_controller_1.CmsController.deleteHeroSlider);
// 2. Campaigns CMS
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

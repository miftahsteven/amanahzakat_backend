import { Router } from 'express';
import {
  getCampaigns,
  getFeaturedCampaigns,
  getCampaignBySlug,
  getDistributions,
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
} from './public.controller';

const router = Router();

// 1. Campaigns & Programs
router.get('/campaigns', getCampaigns);
router.get('/campaigns/featured', getFeaturedCampaigns);
router.get('/campaigns/:slug', getCampaignBySlug);

// 2. Hero Sliders, Testimonials & Settings
router.get('/hero-sliders', getPublicHeroSliders);
router.get('/testimonials', getPublicTestimonials);
router.get('/settings', getPublicWebSettings);

// 3. Distributions & Impact
router.get('/distributions', getDistributions);
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

// 7. Assistance Mustahik
router.post('/assistance/submit', submitAssistance);
router.get('/assistance/check/:nikOrCode', checkAssistanceStatus);

// 8. Muzakki Portal
router.post('/muzakki/login', muzakkiLogin);
router.post('/muzakki/register', muzakkiRegister);
router.put('/muzakki/profile', updateMuzakkiProfile);
router.get('/muzakki/sbmz', getMuzakkiSbmzList);
router.get('/muzakki/recurring', getMuzakkiRecurringPlans);
router.post('/muzakki/recurring', createMuzakkiRecurringPlan);
router.put('/muzakki/recurring/:id/status', toggleRecurringPlanStatus);
router.delete('/muzakki/recurring/:id', deleteRecurringPlan);

export default router;


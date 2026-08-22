"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const public_controller_1 = require("./public.controller");
const router = (0, express_1.Router)();
// 1. Campaigns & Programs
router.get('/campaigns', public_controller_1.getCampaigns);
router.get('/campaigns/featured', public_controller_1.getFeaturedCampaigns);
router.get('/campaigns/:slug', public_controller_1.getCampaignBySlug);
// 2. Distributions & Impact
router.get('/distributions', public_controller_1.getDistributions);
router.get('/distributions/:slug', public_controller_1.getDistributionBySlug);
router.get('/impact/summary', public_controller_1.getImpactSummary);
// 3. FAQs & AI Assistant
router.get('/faqs', public_controller_1.getFaqs);
router.post('/faqs/ask', public_controller_1.askFaqAssistant);
// 4. Donations & ERP Integration
router.post('/donations/payments', public_controller_1.createDonationPayment);
router.get('/donations/:transactionId', public_controller_1.getPaymentStatus);
router.post('/donations/:transactionId/pay', public_controller_1.updatePaymentStatus);
router.get('/donations/:transactionId/receipt', public_controller_1.getReceiptData);
// 5. Verification
router.get('/verification/:code', public_controller_1.verifyDocument);
// 6. Assistance Mustahik
router.post('/assistance/submit', public_controller_1.submitAssistance);
router.get('/assistance/check/:nikOrCode', public_controller_1.checkAssistanceStatus);
// 7. Muzakki Portal
router.post('/muzakki/login', public_controller_1.muzakkiLogin);
router.post('/muzakki/register', public_controller_1.muzakkiRegister);
router.put('/muzakki/profile', public_controller_1.updateMuzakkiProfile);
router.get('/muzakki/sbmz', public_controller_1.getMuzakkiSbmzList);
router.get('/muzakki/recurring', public_controller_1.getMuzakkiRecurringPlans);
router.post('/muzakki/recurring', public_controller_1.createMuzakkiRecurringPlan);
router.put('/muzakki/recurring/:id/status', public_controller_1.toggleRecurringPlanStatus);
router.delete('/muzakki/recurring/:id', public_controller_1.deleteRecurringPlan);
exports.default = router;

import { Router } from 'express';
import {
  handleMidtransNotification,
  checkMidtransStatus,
  simulateMidtransPayment,
} from './midtrans.controller';

const router = Router();

// 1. Webhook Notification endpoints configured in Midtrans Dashboard:
// - Payment Notification URL
router.post('/notification', handleMidtransNotification);
// - Alias for standard Midtrans notification path
router.post('/handling', handleMidtransNotification);
// - Recurring Notification URL
router.post('/recurring', handleMidtransNotification);
// - Pay Account Notification URL
router.post('/pay-account', handleMidtransNotification);

// 2. Real-time Status Check
router.get('/status/:orderId', checkMidtransStatus);

// 3. Testing / Simulation endpoint
router.post('/simulate', simulateMidtransPayment);

export default router;

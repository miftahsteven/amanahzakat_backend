import { Request, Response } from 'express';
import { midtransService, MidtransNotificationPayload } from '../../services/midtrans.service';

/**
 * Handle Midtrans Webhook Notification (Payment, Recurring, Pay Account)
 */
export const handleMidtransNotification = async (req: Request, res: Response) => {
  try {
    const payload: MidtransNotificationPayload = req.body;
    console.log('Received Midtrans Notification:', JSON.stringify(payload, null, 2));

    if (!payload || !payload.order_id) {
      return res.status(200).json({
        status: 'OK',
        message: 'Midtrans test notification probe received successfully',
      });
    }

    // Verify SHA-512 signature key
    const isSignatureValid = midtransService.verifySignature(payload);
    if (!isSignatureValid) {
      console.warn('Warning: Invalid signature key received for order:', payload.order_id);
      return res.status(200).json({
        status: 'WARNING',
        message: 'Invalid signature key, notification acknowledged',
      });
    }

    const result = await midtransService.processNotification(payload);

    return res.status(200).json({
      status: 'OK',
      order_id: payload.order_id,
      transaction_status: result.status,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error handling Midtrans notification:', error);
    return res.status(200).json({
      status: 'OK',
      message: error.message || 'Internal server error acknowledged',
    });
  }
};

/**
 * Check real-time transaction status directly against Midtrans REST API
 */
export const checkMidtransStatus = async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.orderId || '');
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId parameter is required' });
    }

    const result = await midtransService.getTransactionStatus(orderId);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Endpoint for testing / simulating Midtrans webhook callback in development
 */
export const simulateMidtransPayment = async (req: Request, res: Response) => {
  try {
    const { order_id, transaction_status = 'settlement', payment_type = 'qris' } = req.body;

    if (!order_id) {
      return res.status(400).json({ success: false, message: 'order_id is required' });
    }

    const payload: MidtransNotificationPayload = {
      order_id,
      status_code: '200',
      gross_amount: '100000.00',
      transaction_status,
      fraud_status: 'accept',
      payment_type,
      transaction_time: new Date().toISOString(),
      settlement_time: new Date().toISOString(),
    };

    const result = await midtransService.processNotification(payload);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

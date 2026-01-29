import express from 'express';
import { processPayment } from '../controllers/paymentOptionController';
import { 
  getCheckoutUrl, 
  handlePaymentSuccess, 
  handlePaymentCancel,
  handlePayPalWebhook,
  handleFlutterwaveWebhook,
  handleMpesaWebhook
} from '../controllers/paymentController';

const router = express.Router();

// Payment checkout - generates pre-filled payment URLs
router.get('/checkout', getCheckoutUrl);

// Payment success/cancel handlers
router.get('/success', handlePaymentSuccess);
router.get('/cancel', handlePaymentCancel);

// Unified payment endpoint
router.post('/process-payment', processPayment);

// Webhook handlers for payment confirmations
router.post('/webhook/paypal', handlePayPalWebhook);
router.post('/webhook/flutterwave', handleFlutterwaveWebhook);
router.post('/webhook/mpesa', handleMpesaWebhook);

export default router;

